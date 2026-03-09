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
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlparse
from urllib.request import Request, urlopen
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


def _extract_institute_names_from_text(text: str) -> set:
    if not isinstance(text, str) or not text.strip():
        return set()

    # Generic pattern: capture title-cased institute phrases ending with edu keywords.
    pattern = re.compile(
        r"\b(?:[A-Z][A-Za-z0-9&.'-]*\s+){0,8}(?:University|College|School|Institute|Academy|Polytechnic|Campus)"
        r"(?:\s+(?:of|for|at|and|&|the)\s+[A-Z][A-Za-z0-9&.'-]*){0,8}\b"
    )
    return {match.group(0).strip() for match in pattern.finditer(text)}


def _replace_terms_with_token(text: str, terms: set, token: str) -> str:
    if not terms:
        return text

    for term in sorted(terms, key=len, reverse=True):
        escaped = re.escape(term)
        text = re.sub(rf"(?<!\w){escaped}(?!\w)", token, text)
    return text


def _replace_gender_terms(text: str) -> str:
    # Generic gendered indicators (pronouns, titles, and common nouns).
    gender_pattern = re.compile(
        r"\b(he|she|him|her|his|hers|himself|herself|male|female|man|woman|men|women|boy|girl|"
        r"mr|mrs|ms|miss|sir|madam)\b",
        re.IGNORECASE,
    )
    return gender_pattern.sub("<gender>", text)


def anonymize_bias_inducing_text(combined_text: str, entities: list, section_chunks: list) -> str:
    name_terms = set()
    location_terms = set()
    institute_terms = set()
    org_terms = set()

    for entity in entities:
        entity_group = str(entity.get("entity_group", "")).upper()
        word = str(entity.get("word", "")).strip()
        if not word:
            continue

        normalized_word = re.sub(r"\s+", " ", word).strip()
        if not normalized_word:
            continue

        if entity_group == "PER":
            name_terms.add(normalized_word)
        elif entity_group == "LOC":
            location_terms.add(normalized_word)
        elif entity_group == "ORG":
            org_terms.add(normalized_word)
            if re.search(r"\b(university|college|school|institute|academy|polytechnic|campus)\b", normalized_word, re.IGNORECASE):
                institute_terms.add(normalized_word)

    for chunk in section_chunks:
        institute_terms.update(_extract_institute_names_from_text(chunk))

    institute_terms.update(_extract_institute_names_from_text(combined_text))

    anonymized_text = combined_text
    anonymized_text = _replace_terms_with_token(anonymized_text, institute_terms, "<institute-name>")
    anonymized_text = _replace_terms_with_token(anonymized_text, org_terms, "<organization>")
    anonymized_text = _replace_terms_with_token(anonymized_text, name_terms, "<name>")
    anonymized_text = _replace_terms_with_token(anonymized_text, location_terms, "<location>")
    anonymized_text = _replace_gender_terms(anonymized_text)
    return anonymized_text


def _tokenize_for_similarity(text: str) -> set:
    if not isinstance(text, str):
        return set()
    tokens = [t.lower() for t in re.findall(r"[A-Za-z0-9]+", text) if len(t) > 2]
    return set(tokens)


def _jaccard_similarity_score(text_a: str, text_b: str) -> int:
    set_a = _tokenize_for_similarity(text_a)
    set_b = _tokenize_for_similarity(text_b)
    if not set_a or not set_b:
        return 0
    union = set_a | set_b
    if not union:
        return 0
    return int(round((len(set_a & set_b) / len(union)) * 100))


def _compute_integrity_risk_from_coding_report(coding_report: dict, base_risk: int = 24) -> int:
    risk = int(base_risk)
    flags = coding_report.get("flags", []) if isinstance(coding_report, dict) else []

    for flag in flags:
        print(f"Processing coding flag for integrity risk: {flag}")
        flag_text = str(flag)
        if "Rating jump" in flag_text:
            risk += 20
        elif "Low-rated user" in flag_text:
            risk += 20
        elif "hard problems" in flag_text:
            risk += 15
        elif "Solve success rate" in flag_text:
            risk += 15
        elif "Solved" in flag_text:
            risk += 10

    if not flags:
        risk -= 5

    return max(0, min(100, risk))

def analyze_resume(resume_text, candidate_id, company_text: str = ""):
    """
    Analyzes resume text using RoBERTa NER model to extract structured information.
    
    Args:
        resume_text (str): The text content of the resume
        candidate_id (str): The unique identifier for the candidate
        
    Returns:
        tuple[dict, str]: Structured resume data and processed combined text
    """
    print(f"Analyzing resume\n{resume_text[:500]}...")  # Print first 500 chars for debugging
    latex_resume = is_latex(resume_text)
    section_chunks = []
    if(latex_resume):
        print("Detected LaTeX format.")
        sections = parse_latex_sections(resume_text)
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

    # Keep a pre-anonymization snapshot for URL extraction and coding metadata.
    enriched_text = combined_text

    github_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9][A-Za-z0-9-]{0,38}/?', enriched_text, re.IGNORECASE)
    leetcode_match = re.search(r'(?:https?://)?(?:www\.)?leetcode\.com/(?:u/)?[A-Za-z0-9_-]+/?', enriched_text, re.IGNORECASE)
    codeforces_match = re.search(r'(?:https?://)?(?:www\.)?codeforces\.com/profile/[A-Za-z0-9_.-]+/?', enriched_text, re.IGNORECASE)

    profile_data_chunks = []

    if github_match:
        github_url = github_match.group(0).rstrip(').,;')
        try:
            github_text = github_profile_to_text(github_url)
            print((f"github_profile_url:{github_url}\n{github_text}"))
            profile_data_chunks.append(f"github_profile_url:{github_url}\n{github_text}")
        except Exception as exc:
            print(f"GitHub profile enrichment failed: {exc}")

    if leetcode_match:
        leetcode_url = leetcode_match.group(0).rstrip(').,;')
        print(f"LeetCode profile URL: {leetcode_url}")
        profile_data_chunks.append(f"leetcode_profile_url:{leetcode_url}")

    if codeforces_match:
        codeforces_url = codeforces_match.group(0).rstrip(').,;')
        print(f"Codeforces profile URL: {codeforces_url}")
        profile_data_chunks.append(f"codeforces_profile_url:{codeforces_url}")

    if profile_data_chunks:
        enriched_text = f"{enriched_text}\n\n" + "\n\n".join(profile_data_chunks)

    coding_metadata_report = {
        "user": "unknown",
        "suspicious": False,
        "flags": [],
        "metrics": {
            "solves_last_10_min": 0,
            "solves_last_hour": 0,
            "solves_last_day": 0,
            "success_rate": 0.0,
        },
    }
    try:
        coding_metadata_report = generate_coding_metadata_report(enriched_text)
        print(f"Coding metadata report: {coding_metadata_report}")
    except Exception as exc:
        print(f"Coding metadata report generation failed: {exc}")

    # Extract name: prefer guarded NER first, then fallback to Latex title.
    name = extract_name_from_entities(entities)
    if not name:
        name = extract_name_from_latex_title(resume_text) if latex_resume else ""

    # Extract email using regex
    email = ""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_pattern, enriched_text)
    if email_match:
        email = email_match.group(0)

    combined_text = anonymize_bias_inducing_text(enriched_text, entities, section_chunks)
    
    for entity in entities:
        print(f"Entity: {entity['word']}, Label: {entity['entity_group']}")

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
    
    # Placeholder metrics for the new evaluation model.
    ethical_score = 82
    integrity_risk = _compute_integrity_risk_from_coding_report(coding_metadata_report, base_risk=24)
    long_term_retention = 78
    workforce_alignment = 80
    if isinstance(company_text, str) and company_text.strip():
        workforce_alignment = _jaccard_similarity_score(clean_extracted_text(company_text), combined_text)

    # Higher integrity risk should reduce overall score.
    integrity_component = 100 - integrity_risk
    overall_score = int((ethical_score + integrity_component + long_term_retention + workforce_alignment) / 4)
    
    # Determine classification based on overall score
    if overall_score >= 75:
        classification = "Strong Fit"
    elif overall_score >= 50:
        classification = "Trainable Fit"
    else:
        classification = "Risky Fit"
    
    explainability = (
        "Ethical score is currently seeded from a placeholder baseline. "
        "Integrity risk is treated as an inverse factor in overall scoring, while long-term retention "
        "and workforce alignment contribute directly."
    )

    coding_flags = coding_metadata_report.get("flags", []) if isinstance(coding_metadata_report, dict) else []
    coding_metrics = coding_metadata_report.get("metrics", {}) if isinstance(coding_metadata_report, dict) else {}
    if coding_flags:
        explainability += f" Coding anomaly signals: {'; '.join(str(f) for f in coding_flags[:5])}."
    else:
        explainability += " Coding anomaly signals: none detected from available platform data."

    success_rate = coding_metrics.get("success_rate", 0.0)
    solves_last_hour = coding_metrics.get("solves_last_hour", 0)
    explainability += f" Coding metrics snapshot: success_rate={success_rate}, solves_last_hour={solves_last_hour}."
    
    # Return structured data plus processed text for DB persistence.
    analysis_data = {
        "id": candidate_id,
        "name": name if name else "Unknown",
        "email": email,
        "classification": classification,
        "score": overall_score,
        "experience": experience if experience else "Not specified",
        "ethicalScore": ethical_score,
        "integrityRisk": integrity_risk,
        "longTermRetention": long_term_retention,
        "workforceAlignment": workforce_alignment,
        "explainability": explainability,
        "codingMetadata": coding_metadata_report,
    }
    print("Final text data after processing:")
    print(combined_text[:500] + "...")
    return analysis_data, combined_text


def _extract_profile_handle(profile_url: str, provider: str) -> str:
    if not isinstance(profile_url, str) or not profile_url.strip():
        raise ValueError(f"{provider} profile URL is empty")

    normalized_url = profile_url.strip()
    if "://" not in normalized_url:
        normalized_url = f"https://{normalized_url.lstrip('/')}"

    parsed = urlparse(normalized_url)
    if not parsed.netloc:
        raise ValueError(f"Invalid {provider} profile URL: {profile_url}")

    parts = [segment for segment in parsed.path.split("/") if segment]
    if not parts:
        raise ValueError(f"Could not find {provider} username/handle in URL: {profile_url}")

    return parts[-1]


def _flatten_to_key_value_lines(data, parent_key: str = "") -> list:
    lines = []

    if isinstance(data, dict):
        for key, value in data.items():
            next_key = f"{parent_key}.{key}" if parent_key else str(key)
            lines.extend(_flatten_to_key_value_lines(value, next_key))
        return lines

    if isinstance(data, list):
        for index, value in enumerate(data):
            next_key = f"{parent_key}[{index}]" if parent_key else f"[{index}]"
            lines.extend(_flatten_to_key_value_lines(value, next_key))
        if not data and parent_key:
            lines.append(f"{parent_key}:[]")
        return lines

    value_text = "" if data is None else str(data)
    key_text = parent_key if parent_key else "value"
    lines.append(f"{key_text}:{value_text}")
    return lines


def _http_get_json(url: str) -> dict:
    req = Request(url, headers={"User-Agent": "karmafit-backend/1.0", "Accept": "application/json"})
    with urlopen(req, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def github_profile_to_text(github_profile_url: str) -> str:
    username = _extract_profile_handle(github_profile_url, "GitHub")
    payload = _http_get_json(f"https://api.github.com/users/{username}")
    return "\n".join(_flatten_to_key_value_lines(payload))


def extract_coding_handles_from_combined_text(combined_text: str) -> dict:
    handles = {
        "github": None,
        "leetcode": None,
        "codeforces": None,
    }

    if not isinstance(combined_text, str) or not combined_text.strip():
        return handles

    github_match = re.search(r'github_profile_url:((?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9][A-Za-z0-9-]{0,38}/?)', combined_text, re.IGNORECASE)
    leetcode_match = re.search(r'leetcode_profile_url:((?:https?://)?(?:www\.)?leetcode\.com/(?:u/)?[A-Za-z0-9_-]+/?)', combined_text, re.IGNORECASE)
    codeforces_match = re.search(r'codeforces_profile_url:((?:https?://)?(?:www\.)?codeforces\.com/profile/[A-Za-z0-9_.-]+/?)', combined_text, re.IGNORECASE)

    if github_match:
        handles["github"] = _extract_profile_handle(github_match.group(1), "GitHub")
    if leetcode_match:
        handles["leetcode"] = _extract_profile_handle(leetcode_match.group(1), "LeetCode")
    if codeforces_match:
        handles["codeforces"] = _extract_profile_handle(codeforces_match.group(1), "Codeforces")

    return handles


def _unix_to_iso8601(ts: int) -> str:
    try:
        return datetime.fromtimestamp(int(ts), tz=timezone.utc).isoformat()
    except Exception:
        return ""


def get_codeforces_submission_events(handle: str, count: int = 200) -> list:
    if not handle:
        return []

    payload = _http_get_json(f"https://codeforces.com/api/user.status?handle={handle}&from=1&count={count}")
    if payload.get("status") != "OK":
        return []

    events = []
    for sub in payload.get("result", []):
        ts = sub.get("creationTimeSeconds")
        problem = sub.get("problem", {}) if isinstance(sub.get("problem"), dict) else {}
        events.append(
            {
                "platform": "codeforces",
                "title": problem.get("name", ""),
                "timestamp": int(ts) if isinstance(ts, (int, float)) else 0,
                "timestamp_iso": _unix_to_iso8601(ts) if ts else "",
                "verdict": sub.get("verdict", ""),
                "accepted": sub.get("verdict") == "OK",
                "contestId": sub.get("contestId"),
                "problem_difficulty": problem.get("rating"),
                "problem_index": problem.get("index"),
                "statusDisplay": "Accepted" if sub.get("verdict") == "OK" else (sub.get("verdict") or "Unknown"),
            }
        )

    return sorted(events, key=lambda e: e.get("timestamp", 0))


def get_codeforces_rating_events(handle: str) -> list:
    if not handle:
        return []

    payload = _http_get_json(f"https://codeforces.com/api/user.rating?handle={handle}")
    if payload.get("status") != "OK":
        return []

    events = []
    for row in payload.get("result", []):
        ts = row.get("ratingUpdateTimeSeconds")
        old_rating = row.get("oldRating")
        new_rating = row.get("newRating")
        delta = None
        if isinstance(old_rating, int) and isinstance(new_rating, int):
            delta = new_rating - old_rating

        events.append(
            {
                "platform": "codeforces",
                "contestId": row.get("contestId"),
                "contestName": row.get("contestName", ""),
                "rank": row.get("rank"),
                "oldRating": old_rating,
                "newRating": new_rating,
                "ratingDelta": delta,
                "timestamp": int(ts) if isinstance(ts, (int, float)) else 0,
                "timestamp_iso": _unix_to_iso8601(ts) if ts else "",
            }
        )

    return sorted(events, key=lambda e: e.get("timestamp", 0))


def get_leetcode_recent_submission_events(username: str, limit: int = 50) -> list:
    if not username:
        return []

    query = {
        "query": (
            "query recentSubmissionList($username: String!, $limit: Int!) { "
            "recentSubmissionList(username: $username, limit: $limit) { "
            "title statusDisplay timestamp titleSlug lang __typename "
            "} "
            "}"
        ),
        "variables": {"username": username, "limit": limit},
    }

    req = Request(
        "https://leetcode.com/graphql",
        data=json.dumps(query).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "karmafit-backend/1.0",
            "Accept": "application/json",
        },
        method="POST",
    )

    with urlopen(req, timeout=20) as response:
        payload = json.loads(response.read().decode("utf-8"))

    events = []
    for row in payload.get("data", {}).get("recentSubmissionList", []) or []:
        ts_raw = row.get("timestamp")
        try:
            ts = int(ts_raw)
        except Exception:
            ts = 0

        status_display = str(row.get("statusDisplay", ""))
        events.append(
            {
                "platform": "leetcode",
                "title": row.get("title", ""),
                "titleSlug": row.get("titleSlug", ""),
                "timestamp": ts,
                "timestamp_iso": _unix_to_iso8601(ts) if ts else "",
                "statusDisplay": status_display,
                "accepted": status_display.lower() in {"accepted", "ac"},
                "verdict": "OK" if status_display.lower() in {"accepted", "ac"} else status_display,
                "contestId": None,
                "problem_difficulty": None,
            }
        )

    return sorted(events, key=lambda e: e.get("timestamp", 0))


def build_empty_coding_metadata_report(user_handle: str) -> dict:
    # Contract-only scaffold for the next step where anomaly rules are applied.
    return {
        "user": user_handle,
        "suspicious": False,
        "flags": [],
        "metrics": {
            "solves_last_10_min": 0,
            "solves_last_hour": 0,
            "solves_last_day": 0,
            "success_rate": 0.0,
        },
    }


def collect_coding_metadata_inputs(combined_text: str) -> dict:
    """
    Incremental step helper:
    1) extract coding handles from combined_text
    2) fetch platform submission/rating timelines
    3) return normalized raw inputs for downstream anomaly detection
    """
    handles = extract_coding_handles_from_combined_text(combined_text)

    codeforces_handle = handles.get("codeforces")
    leetcode_username = handles.get("leetcode")
    primary_user = codeforces_handle or leetcode_username or "unknown"

    codeforces_submissions = []
    codeforces_rating_changes = []
    leetcode_submissions = []

    if codeforces_handle:
        try:
            codeforces_submissions = get_codeforces_submission_events(codeforces_handle)
        except Exception as exc:
            print(f"Codeforces submission fetch failed: {exc}")
        try:
            codeforces_rating_changes = get_codeforces_rating_events(codeforces_handle)
        except Exception as exc:
            print(f"Codeforces rating fetch failed: {exc}")

    if leetcode_username:
        try:
            leetcode_submissions = get_leetcode_recent_submission_events(leetcode_username)
        except Exception as exc:
            print(f"LeetCode submission fetch failed: {exc}")

    return {
        "handles": handles,
        "user": primary_user,
        "codeforces_submissions": codeforces_submissions,
        "codeforces_rating_changes": codeforces_rating_changes,
        "leetcode_submissions": leetcode_submissions,
        "report": build_empty_coding_metadata_report(primary_user),
    }


def _accepted_events(events: list) -> list:
    accepted = [e for e in events if e.get("accepted") and isinstance(e.get("timestamp"), int) and e.get("timestamp", 0) > 0]
    return sorted(accepted, key=lambda e: e.get("timestamp", 0))


def _count_recent(events: list, window_seconds: int, now_ts: int) -> int:
    cutoff = now_ts - window_seconds
    return sum(1 for e in events if e.get("timestamp", 0) >= cutoff)


def _max_events_in_window(events: list, window_seconds: int) -> int:
    if not events:
        return 0

    timestamps = [e.get("timestamp", 0) for e in events]
    left = 0
    best = 0
    for right in range(len(timestamps)):
        while timestamps[right] - timestamps[left] > window_seconds:
            left += 1
        best = max(best, right - left + 1)
    return best


def _is_hard_problem(event: dict) -> bool:
    difficulty = event.get("problem_difficulty")
    if isinstance(difficulty, str):
        return difficulty.strip().lower() == "hard"
    if isinstance(difficulty, (int, float)):
        # Codeforces hard-ish threshold proxy.
        return difficulty >= 1900
    return False


def _get_codeforces_contest_participants(contest_id: int, cache: dict) -> Optional[int]:
    if not contest_id:
        return None

    if contest_id in cache:
        return cache[contest_id]

    try:
        payload = _http_get_json(f"https://codeforces.com/api/contest.ratingChanges?contestId={contest_id}")
        if payload.get("status") == "OK":
            result = payload.get("result", [])
            participants = len(result) if isinstance(result, list) else None
            cache[contest_id] = participants
            return participants
    except Exception:
        pass

    cache[contest_id] = None
    return None


def evaluate_coding_metadata_rules(coding_inputs: dict) -> dict:
    user = coding_inputs.get("user", "unknown")
    cf_subs = coding_inputs.get("codeforces_submissions", [])
    lc_subs = coding_inputs.get("leetcode_submissions", [])
    cf_ratings = coding_inputs.get("codeforces_rating_changes", [])

    all_submissions = sorted(cf_subs + lc_subs, key=lambda e: e.get("timestamp", 0))
    accepted = _accepted_events(all_submissions)
    hard_accepted = [e for e in accepted if _is_hard_problem(e)]

    now_ts = int(datetime.now(tz=timezone.utc).timestamp())
    solves_last_10_min = _count_recent(accepted, 10 * 60, now_ts)
    solves_last_hour = _count_recent(accepted, 60 * 60, now_ts)
    solves_last_day = _count_recent(accepted, 24 * 60 * 60, now_ts)

    max_10_min = _max_events_in_window(accepted, 10 * 60)
    max_1_hour = _max_events_in_window(accepted, 60 * 60)
    max_24_hours = _max_events_in_window(accepted, 24 * 60 * 60)
    max_hard_2_hours = _max_events_in_window(hard_accepted, 2 * 60 * 60)

    accepted_count = len(accepted)
    total_submissions = len([e for e in all_submissions if isinstance(e.get("timestamp"), int) and e.get("timestamp", 0) > 0])
    success_rate = (accepted_count / total_submissions) if total_submissions > 0 else 0.0

    flags = []

    # A. Solve speed detection
    if max_1_hour >= 10:
        flags.append(f"Solved {max_1_hour} problems in 1 hour")
    if max_24_hours >= 30:
        flags.append(f"Solved {max_24_hours} problems in 24 hours")
    if max_10_min >= 5:
        flags.append(f"Solved {max_10_min} problems in 10 minutes")

    # B. Hard problem anomaly
    if max_hard_2_hours > 5:
        flags.append(f"Solved {max_hard_2_hours} hard problems in 2 hours")

    # C. No-failure pattern
    if total_submissions > 0 and success_rate > 0.95:
        flags.append(f"Solve success rate {int(success_rate * 100)}%")

    # D. Codeforces rating spike
    for row in cf_ratings:
        delta = row.get("ratingDelta")
        if isinstance(delta, int) and delta > 300:
            contest_id = row.get("contestId")
            flags.append(f"Rating jump +{delta} in contest {contest_id}")

    # E. Contest performance anomaly
    participant_cache = {}
    for row in cf_ratings:
        old_rating = row.get("oldRating")
        rank = row.get("rank")
        contest_id = row.get("contestId")
        if not (isinstance(old_rating, int) and isinstance(rank, int) and isinstance(contest_id, int)):
            continue
        if old_rating < 1400 and rank <= 50:
            participants = _get_codeforces_contest_participants(contest_id, participant_cache)
            if isinstance(participants, int) and participants >= 1000:
                flags.append(
                    f"Low-rated user ({old_rating}) achieved rank {rank} in large contest {contest_id} ({participants} participants)"
                )

    report = {
        "user": user,
        "suspicious": len(flags) > 0,
        "flags": flags,
        "metrics": {
            "solves_last_10_min": solves_last_10_min,
            "solves_last_hour": solves_last_hour,
            "solves_last_day": solves_last_day,
            "max_solves_in_10_min_window": max_10_min,
            "max_solves_in_1_hour_window": max_1_hour,
            "max_solves_in_24_hour_window": max_24_hours,
            "max_hard_solves_in_2_hour_window": max_hard_2_hours,
            "accepted_submissions": accepted_count,
            "total_submissions": total_submissions,
            "success_rate": round(success_rate, 4),
        },
    }
    return report


def generate_coding_metadata_report(combined_text: str) -> dict:
    coding_inputs = collect_coding_metadata_inputs(combined_text)
    return evaluate_coding_metadata_rules(coding_inputs)


def clean_extracted_text(text: str) -> str:
    """
    Clean OCR-extracted text for downstream similarity and parsing.
    If LaTeX-like patterns are present, strip LaTeX markup first.
    """
    if not isinstance(text, str) or not text.strip():
        return ""

    cleaned = strip_latex_markup(text) if is_latex(text) else text
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned
