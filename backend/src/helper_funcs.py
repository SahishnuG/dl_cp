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
        print(f"Image already exists at {output_path}")
        return output_path

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
import uuid

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

# ============ Authentication & Database Setup ============
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy import create_engine, Column, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/karmafit_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-min-32-chars")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# Database Models
class User(Base):
    """User model for candidate authentication"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


# Create tables
Base.metadata.create_all(bind=engine)


# Authentication helper functions
def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def register_candidate(email: str, password: str, full_name: Optional[str] = None) -> dict:
    """
    Register a new candidate in the database.
    
    Args:
        email (str): Candidate's email address
        password (str): Plain text password (will be hashed)
        full_name (str, optional): Candidate's full name
    
    Returns:
        dict: Contains user info and JWT access token
        
    Raises:
        ValueError: If email already exists or validation fails
    """
    # Validate password strength (min 8 chars)
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise ValueError("Email already registered")
        
        # Create new user
        user_id = str(uuid.uuid4())
        hashed_pwd = hash_password(password)
        
        new_user = User(
            id=user_id,
            email=email,
            hashed_password=hashed_pwd,
            full_name=full_name,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        # Save to database
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Generate JWT access token
        access_token = create_access_token(
            data={"sub": email, "user_id": user_id}
        )
        
        return {
            "id": user_id,
            "email": email,
            "full_name": full_name,
            "access_token": access_token,
            "token_type": "bearer",
            "message": "Registration successful"
        }
        
    except ValueError as e:
        db.rollback()
        raise e
    except Exception as e:
        db.rollback()
        raise Exception(f"Registration failed: {str(e)}")
    finally:
        db.close()


def login_candidate(email: str, password: str) -> dict:
    """
    Authenticate a candidate and return JWT token.
    
    Args:
        email (str): Candidate's email
        password (str): Plain text password
    
    Returns:
        dict: Contains user info and JWT access token
        
    Raises:
        ValueError: If credentials are invalid
    """
    db = SessionLocal()
    
    try:
        # Find user by email
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise ValueError("Invalid email or password")
        
        # Verify password
        if not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")
        
        # Check if user is active
        if not user.is_active:
            raise ValueError("Account is deactivated")
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Generate JWT access token
        access_token = create_access_token(
            data={"sub": email, "user_id": user.id}
        )
        
        return {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "access_token": access_token,
            "token_type": "bearer",
            "message": "Login successful"
        }
        
    except ValueError as e:
        raise e
    except Exception as e:
        raise Exception(f"Login failed: {str(e)}")
    finally:
        db.close()