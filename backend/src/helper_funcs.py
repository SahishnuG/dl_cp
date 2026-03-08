import os
from PIL import Image, ImageDraw, ImageFont
from pdf2image import convert_from_path
from docx import Document

def convert_to_image(file_path, output_folder="output_images"):
    os.makedirs(output_folder, exist_ok=True)

    file_name = os.path.basename(file_path)
    name, ext = os.path.splitext(file_name)
    ext = ext.lower()

    output_path = os.path.join(output_folder, f"{name}.png")
    if os.path.exists(output_path):
        print(f"Image already exists at {output_path}, Processing again.")

    # 1️⃣ If already an image
    if ext in [".png", ".jpg", ".jpeg", ".bmp", ".webp"]:
        img = Image.open(file_path)
        img.save(output_path)
        print(f"Image saved at {output_path}")
        return output_path

    # 2️⃣ PDF → Image
    elif ext == ".pdf":
        pages = convert_from_path(file_path,
                                  poppler_path=r"D:\Program Files\poppler-25.12.0\Library\bin")
        pages[0].save(output_path, "PNG")
        print(f"PDF converted to image at {output_path}")
        return output_path

    # 3️⃣ TXT → Image
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()

        img = Image.new("RGB", (1000, 1200), "white")
        draw = ImageDraw.Draw(img)

        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()

        draw.multiline_text((50, 50), text, fill="black", font=font)
        img.save(output_path)
        print(f"Text file converted to image at {output_path}")
        return output_path

    # 4️⃣ DOCX → Image
    elif ext == ".docx":
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])

        img = Image.new("RGB", (1000, 1200), "white")
        draw = ImageDraw.Draw(img)

        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()

        draw.multiline_text((50, 50), text, fill="black", font=font)
        img.save(output_path)
        print(f"DOCX converted to image at {output_path}")
        return output_path

    else:
        raise ValueError(f"Unsupported file type: {ext}")

from config.settings import Settings
settings = Settings()

def read_resume(resume_path):
    device = settings.device
    model = settings.model
    processor = settings.processor
    print(f"Using device: {device}\nmodel: {model.__class__.__name__}\nprocessor: {processor.__class__.__name__}")
    print(f"Processing file: {resume_path}")
    image = convert_to_image(resume_path)
    inputs = processor(
    image,
    return_tensors="pt",
    format=True
    ).to(model.device)

    generate_ids = model.generate(
    **inputs,
    tokenizer=processor.tokenizer,
    stop_strings="<|im_end|>",
    do_sample=False,
    max_new_tokens=2048,
    )
    
    result = processor.decode(
        generate_ids[0, inputs["input_ids"].shape[1]:],
        skip_special_tokens=True
    )
    return result

import re
import json
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification

def is_latex(text: str) -> bool:
    """
    Detect whether the input text is likely LaTeX.

    Strategy:
    1) Fast lightweight heuristic (regex markers)
    """
    if not isinstance(text, str) or not text.strip():
        return False

    sample = text[:50000]

    # Strong markers are enough by themselves.
    strong_patterns = [
        r'\\documentclass(?:\[[^\]]*\])?\{[^}]+\}',
        r'\\usepackage(?:\[[^\]]*\])?\{[^}]+\}',
        r'\\begin\{[^}]+\}',
        r'\\end\{[^}]+\}',
    ]
    if any(re.search(pattern, sample) for pattern in strong_patterns):
        return True

    # Lightweight heuristic (supports starred commands like \section*{}).
    heuristic_patterns = [
        r'\\title\*?\{',
        r'\\section\*?\{',
        r'\\subsection\*?\{',
        r'\\subsubsection\*?\{',
        r'\\item\b',
        r'\\text(?:bf|it|tt|sc)\{',
        r'\\[a-zA-Z]{2,}\*?\{',
        r'\$[^\n$]{1,120}\$',
        r'\\\(|\\\)|\\\[|\\\]',
    ]

    score = sum(bool(re.search(pattern, sample)) for pattern in heuristic_patterns)
    if score < 2:
        return False

    return True


def parse_latex_sections(latex_text: str):
    """
    Parse LaTeX sections and preserve a preamble bucket.
    Uses regex section boundaries for reliable resume segmentation.
    """
    sections = {}
    pattern = re.compile(r'\\section\*?\{([^}]*)\}')
    matches = list(pattern.finditer(latex_text))

    if not matches:
        sections["__preamble__"] = latex_text.strip()
        return sections

    sections["__preamble__"] = latex_text[:matches[0].start()].strip()

    for idx, match in enumerate(matches):
        title = match.group(1).strip() or f"section_{idx+1}"
        content_start = match.end()
        content_end = matches[idx + 1].start() if idx + 1 < len(matches) else len(latex_text)
        sections[title] = latex_text[content_start:content_end].strip()

    return sections


def strip_latex_markup(text: str) -> str:
    """
    Convert LaTeX-heavy text into plain text for NER.
    Keeps human-readable words and removes commands/formatting tokens.
    """
    if not isinstance(text, str) or not text.strip():
        return ""

    cleaned = text
    # Drop comments.
    cleaned = re.sub(r'(?m)%.*$', ' ', cleaned)
    # Replace common sectioning/item commands with spaces.
    cleaned = re.sub(r'\\(?:section|subsection|subsubsection|paragraph|subparagraph)\*?\{[^}]*\}', ' ', cleaned)
    cleaned = re.sub(r'\\item\b', ' ', cleaned)
    # Flatten command arguments like \textbf{Python} -> Python.
    cleaned = re.sub(r'\\[a-zA-Z]+\*?(?:\[[^\]]*\])?\{([^}]*)\}', r' \1 ', cleaned)
    # Remove remaining commands, escapes, braces, and math delimiters.
    cleaned = re.sub(r'\\[a-zA-Z]+\*?(?:\[[^\]]*\])?', ' ', cleaned)
    cleaned = re.sub(r'[{}$]', ' ', cleaned)
    cleaned = re.sub(r'\\[\[\]()]', ' ', cleaned)
    cleaned = re.sub(r'\\', ' ', cleaned)
    # Normalize whitespace.
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def ner_on_latex_sections(resume_text):
    """
    Runs NER on each LaTeX section separately and
    returns a single combined entity list.
    """

    sections = parse_latex_sections(resume_text)

    all_entities = []

    for section_name, content in sections.items():
        heading_label = section_name.replace("_", " ").strip()
        heading_label = re.sub(r"\s+", " ", heading_label)

        plain_content = strip_latex_markup(content)
        if not plain_content:
            continue

        if heading_label and heading_label != "__preamble__":
            # Keep heading semantics in plain language so NER sees section context.
            plain_content = f"Section heading: {heading_label}. {plain_content}"
        elif heading_label == "__preamble__":
            plain_content = f"Section heading: Preamble. {plain_content}"

        entities = ner_pipeline(plain_content)

        for ent in entities:
            ent_copy = ent.copy()

            # optional but useful for debugging
            ent_copy["section"] = section_name

            all_entities.append(ent_copy)

    return all_entities

# Load RoBERTa NER model for resume parsing
ner_tokenizer = AutoTokenizer.from_pretrained("Jean-Baptiste/roberta-large-ner-english")
ner_model = AutoModelForTokenClassification.from_pretrained("Jean-Baptiste/roberta-large-ner-english")
ner_pipeline = pipeline("ner", model=ner_model, tokenizer=ner_tokenizer, aggregation_strategy="simple")


def extract_name_from_latex_title(resume_text: str) -> str:
    match = re.search(r'\\title\*?\{([^}]*)\}', resume_text, re.DOTALL)
    if not match:
        return ""

    title_text = match.group(1).strip()
    title_text = re.sub(r'\\[a-zA-Z]+\*?(?:\[[^\]]*\])?\{[^}]*\}', ' ', title_text)
    title_text = re.sub(r'\\[a-zA-Z]+\*?', ' ', title_text)
    title_text = re.sub(r'\s+', ' ', title_text).strip()
    return title_text


def extract_name_from_entities(entities) -> str:
    full_name_candidate = ""
    single_name_candidate = ""

    for entity in entities:
        if entity.get('entity_group') != 'PER':
            continue

        raw_name = str(entity.get('word', '')).strip()
        # Keep alphabetic characters, spaces, apostrophes and hyphens for names.
        cleaned = re.sub(r"[^A-Za-z\s'\-]", ' ', raw_name)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        if not cleaned:
            continue

        alpha_chars = re.sub(r'[^A-Za-z]', '', cleaned)
        if len(alpha_chars) < 3:
            # Guardrail: ignore very short PER tokens (e.g., "A", "Sa").
            continue

        parts = [p for p in cleaned.split(' ') if p]
        if len(parts) >= 2 and all(re.fullmatch(r"[A-Za-z][A-Za-z'\-]*", p) for p in parts):
            full_name_candidate = ' '.join(parts)
            break

        if not single_name_candidate and re.fullmatch(r"[A-Za-z][A-Za-z'\-]*", cleaned):
            single_name_candidate = cleaned

    return full_name_candidate or single_name_candidate

def analyze_resume(resume_text, candidate_id):
    """
    Analyzes resume text using RoBERTa NER model to extract structured information.
    
    Args:
        resume_text (str): The text content of the resume
        candidate_id (str): The unique identifier for the candidate
        
    Returns:
        dict: Structured resume data with extracted fields
    """
    print(f"Analyzing resume\n{resume_text[:500]}...")  # Print first 500 chars for debugging
    latex_resume = is_latex(resume_text)
    if(latex_resume):
        print("Detected LaTeX format.")
        sections = parse_latex_sections(resume_text)
        section_chunks = []
        entities = []

        for section_name, content in sections.items():
            heading_label = section_name.replace("_", " ").strip()
            heading_label = re.sub(r"\s+", " ", heading_label)

            plain_content = strip_latex_markup(content)
            if not plain_content:
                continue

            if heading_label and heading_label != "__preamble__":
                chunk = f"Section heading: {heading_label}. {plain_content}"
            elif heading_label == "__preamble__":
                chunk = f"Section heading: Preamble. {plain_content}"
            else:
                chunk = plain_content

            print(f"[NER] section={section_name} chars={len(chunk)}")
            print(f"[NER] chunk preview: {chunk[:500]}...")
            section_chunks.append(chunk)
            entities.extend(ner_pipeline(chunk))

        combined_text = "\n".join(section_chunks)
    else:
        print("Detected plain text format.")
        combined_text = strip_latex_markup(resume_text)
        if not combined_text:
            combined_text = resume_text
        entities = ner_pipeline(combined_text)

    # Extract name: prefer guarded NER first, then fallback to Latex title.
    
    for entity in entities:
        print(f"Entity: {entity['word']}, Label: {entity['entity_group']}")

    name = extract_name_from_entities(entities)
    if not name:
        name = extract_name_from_latex_title(resume_text) if latex_resume else ""
    
    # Extract email using regex
    email = ""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_pattern, combined_text)
    if email_match:
        email = email_match.group(0)

    # Extract experience (years)
    experience = ""
    exp_patterns = [
        r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience)?',
        r'(?:experience|exp)[:.]?\s*(\d+)\+?\s*(?:years?|yrs?)?'
    ]
    for pattern in exp_patterns:
        exp_match = re.search(pattern, combined_text, re.IGNORECASE)
        if exp_match:
            years = exp_match.group(1)
            experience = f"{years}+ years"
            break
    
    # Extract skills/strengths
    # Common tech skills keywords
    tech_keywords = [
        'python', 'java', 'javascript', 'react', 'node', 'sql', 'mongodb',
        'aws', 'docker', 'kubernetes', 'machine learning', 'deep learning',
        'tensorflow', 'pytorch', 'git', 'agile', 'scrum', 'api', 'rest',
        'html', 'css', 'typescript', 'angular', 'vue', 'c++', 'c#', 'go',
        'ruby', 'php', 'swift', 'kotlin', 'rust', 'scala', 'django', 'flask',
        'spring', 'fastapi', 'postgres', 'mysql', 'redis', 'elasticsearch',
        'ci/cd', 'devops', 'microservices', 'cloud', 'azure', 'gcp', 'linux'
    ]
    
    strengths = []
    text_lower = combined_text.lower()
    for skill in tech_keywords:
        if skill in text_lower:
            strengths.append(skill.title())
    
    # Remove duplicates and limit to top strengths
    strengths = list(set(strengths))[:8]
    
    # Analyze position/role
    position = ""
    role_patterns = [
        r'(?:applying\s+for|position|role|title)[:.]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})',
        r'([A-Z][a-z]+\s+(?:Engineer|Developer|Manager|Analyst|Scientist|Designer|Architect))'
    ]
    for pattern in role_patterns:
        role_match = re.search(pattern, combined_text)
        if role_match:
            position = role_match.group(1)
            break
    
    # Calculate scores based on content analysis
    # Technical score based on number of skills found
    technical_score = min(len(strengths) * 10, 100)
    
    # Cultural score (simplified heuristic based on soft skills keywords)
    soft_skills = ['leadership', 'communication', 'teamwork', 'problem solving', 
                   'collaboration', 'creativity', 'adaptability', 'initiative']
    cultural_matches = sum(1 for skill in soft_skills if skill in text_lower)
    cultural_score = min(cultural_matches * 12 + 40, 100)
    
    # Growth potential (based on experience and education mentions)
    growth_indicators = ['certified', 'certification', 'degree', 'bachelor', 'master',
                        'phd', 'training', 'course', 'project', 'award']
    growth_matches = sum(1 for indicator in growth_indicators if indicator in text_lower)
    growth_potential = min(growth_matches * 10 + 50, 100)
    
    # Overall score (weighted average)
    overall_score = int((technical_score * 0.4 + cultural_score * 0.3 + growth_potential * 0.3))
    
    # Determine classification based on overall score
    if overall_score >= 75:
        classification = "Strong Fit"
    elif overall_score >= 50:
        classification = "Trainable Fit"
    else:
        classification = "Risky Fit"
    
    # Identify weaknesses (missing common skills)
    all_common_skills = ['python', 'java', 'sql', 'docker', 'git', 'api', 'testing', 'agile']
    weaknesses = [skill.title() for skill in all_common_skills if skill not in text_lower][:5]
    
    # Return structured data
    return {
        "id": candidate_id,
        "name": name if name else "Unknown",
        "email": email,
        "position": position if position else "Not specified",
        "classification": classification,
        "score": overall_score,
        "experience": experience if experience else "Not specified",
        "strengths": strengths if strengths else ["None identified"],
        "weaknesses": weaknesses if weaknesses else ["None identified"],
        "technicalScore": technical_score,
        "culturalScore": cultural_score,
        "growthPotential": growth_potential
    }
