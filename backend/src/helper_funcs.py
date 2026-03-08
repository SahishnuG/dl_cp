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

try:
    from pylatexenc.latexwalker import LatexWalker, LatexMacroNode
except Exception:
    LatexWalker = None
    LatexMacroNode = None

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
    Parse LaTeX sections dynamically and treat the preamble
    as a normal section.
    """
    sections = {}

    # Fallback path when pylatexenc is unavailable.
    if LatexWalker is None or LatexMacroNode is None:
        parts = re.split(r'\\section\*?\{([^}]*)\}', latex_text)
        sections["__preamble__"] = parts[0].strip()
        for i in range(1, len(parts), 2):
            title = parts[i].strip()
            content = parts[i + 1].strip()
            sections[title] = content
        return sections

    section_markers = []

    def _node_source(node):
        pos = getattr(node, "pos", None)
        length = getattr(node, "len", None)
        if isinstance(pos, int) and isinstance(length, int) and length >= 0:
            return latex_text[pos:pos + length]
        return ""

    def _extract_section_title(node):
        nodeargd = getattr(node, "nodeargd", None)
        if nodeargd is None:
            return ""

        argnlist = getattr(nodeargd, "argnlist", None)
        if not argnlist or argnlist[0] is None:
            return ""

        raw = _node_source(argnlist[0]).strip()
        if raw.startswith("{") and raw.endswith("}") and len(raw) >= 2:
            return raw[1:-1].strip()
        return raw

    def walk_nodes(nodes):
        if not nodes:
            return

        for node in nodes:
            if isinstance(node, LatexMacroNode) and node.macroname == "section":
                start_pos = getattr(node, "pos", None)
                node_len = getattr(node, "len", None)
                if not isinstance(start_pos, int) or not isinstance(node_len, int) or node_len <= 0:
                    continue

                title = _extract_section_title(node)
                section_markers.append((start_pos, start_pos + node_len, title))

            child_nodes = getattr(node, "nodelist", None)
            if child_nodes:
                walk_nodes(child_nodes)

            nodeargd = getattr(node, "nodeargd", None)
            if nodeargd is not None:
                argnlist = getattr(nodeargd, "argnlist", None)
                if argnlist:
                    for arg_node in argnlist:
                        if arg_node is None:
                            continue
                        nested = getattr(arg_node, "nodelist", None)
                        if nested:
                            walk_nodes(nested)

    try:
        parsed_nodes, _, _ = LatexWalker(latex_text).get_latex_nodes()
        walk_nodes(parsed_nodes)
    except Exception:
        parsed_nodes = None

    if not section_markers:
        parts = re.split(r'\\section\*?\{([^}]*)\}', latex_text)
        sections["__preamble__"] = parts[0].strip()
        for i in range(1, len(parts), 2):
            title = parts[i].strip()
            content = parts[i + 1].strip()
            sections[title] = content
        return sections

    section_markers.sort(key=lambda item: item[0])
    sections["__preamble__"] = latex_text[:section_markers[0][0]].strip()

    for idx, (_, command_end, title) in enumerate(section_markers):
        next_start = section_markers[idx + 1][0] if idx + 1 < len(section_markers) else len(latex_text)
        sections[title] = latex_text[command_end:next_start].strip()

    return sections

def ner_on_latex_sections(resume_text):
    """
    Runs NER on each LaTeX section separately and
    returns a single combined entity list.
    """

    sections = parse_latex_sections(resume_text)

    all_entities = []

    for section_name, content in sections.items():

        entities = ner_pipeline(content)

        for ent in entities:
            ent_copy = ent.copy()

            # optional but useful for debugging
            ent_copy["section"] = section_name

            all_entities.append(ent_copy)

    return all_entities

# Load RoBERTa NER model for resume parsing
ner_tokenizer = AutoTokenizer.from_pretrained("dslim/bert-base-NER")
ner_model = AutoModelForTokenClassification.from_pretrained("dslim/bert-base-NER")
ner_pipeline = pipeline("ner", model=ner_model, tokenizer=ner_tokenizer, aggregation_strategy="simple")

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
    if(is_latex(resume_text)):
        print("Detected LaTeX format.")
        entities = ner_on_latex_sections(resume_text)
    else:
        print("Detected plain text format.")
        # Extract entities using NER
        entities = ner_pipeline(resume_text)
    
    # Extract name (first PERSON entity)
    name = ""
    for entity in entities:
        print(f"Entity: {entity['word']}, Label: {entity['entity_group']}")
        if entity['entity_group'] == 'PER':
            name = entity['word']
            break
    
    # Extract email using regex
    email = ""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_pattern, resume_text)
    if email_match:
        email = email_match.group(0)
    
    # Extract phone number
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    phone_match = re.search(phone_pattern, resume_text)
    phone = phone_match.group(0) if phone_match else ""
    
    # Extract experience (years)
    experience = ""
    exp_patterns = [
        r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience)?',
        r'(?:experience|exp)[:.]?\s*(\d+)\+?\s*(?:years?|yrs?)?'
    ]
    for pattern in exp_patterns:
        exp_match = re.search(pattern, resume_text, re.IGNORECASE)
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
    text_lower = resume_text.lower()
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
        role_match = re.search(pattern, resume_text)
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
