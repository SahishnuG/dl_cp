from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv, find_dotenv
from typing import Optional
from jwt import PyJWKClient
from sqlalchemy.orm import Session
import jwt
import os
import shutil
import json
from urllib import error, request
from src.helper_funcs import (
    read_resume,
    analyze_resume,
    clean_extracted_text,
)
from src.database import init_db, get_db, Candidate

from config.settings import Settings
settings = Settings()

CLERK_JWKS_URL = settings.clerk_jwks_url
CLERK_ISSUER = settings.clerk_issuer
CLERK_AUDIENCE = settings.clerk_audience
CLERK_SECRET_KEY = settings.clerk_secret_key
CLERK_API_BASE = settings.clerk_api_base

app = FastAPI(
    title="Karmafit API",
    description="Resume Analysis API with Clerk Authentication",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories if they don't exist
RESUMES_DIR = "resumes"
INTERVIEWS_DIR = "interviews"
COMPANY_DOCS_DIR = "company_docs"
OUTPUT_IMAGES_DIR = "output_images"
os.makedirs(RESUMES_DIR, exist_ok=True)
os.makedirs(INTERVIEWS_DIR, exist_ok=True)
os.makedirs(COMPANY_DOCS_DIR, exist_ok=True)
os.makedirs(OUTPUT_IMAGES_DIR, exist_ok=True)


def _company_doc_text_path(user_id: str) -> str:
    return os.path.join(COMPANY_DOCS_DIR, "current_company_doc.txt")


def _company_doc_file_path(extension: str) -> str:
    return os.path.join(COMPANY_DOCS_DIR, f"current_company_doc{extension}")


def _load_global_company_text() -> str:
    path = _company_doc_text_path("")
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("Database initialized successfully")


# Dependency to verify Clerk JWT token
async def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")

        if not CLERK_JWKS_URL:
            raise HTTPException(status_code=500, detail="CLERK_JWKS_URL is not configured")

        signing_key = PyJWKClient(CLERK_JWKS_URL).get_signing_key_from_jwt(token).key

        decode_kwargs = {
            "key": signing_key,
            "algorithms": ["RS256"],
        }

        if CLERK_ISSUER:
            decode_kwargs["issuer"] = CLERK_ISSUER
        else:
            decode_kwargs["options"] = {"verify_iss": False}

        if CLERK_AUDIENCE:
            decode_kwargs["audience"] = CLERK_AUDIENCE
        else:
            options = decode_kwargs.get("options", {})
            options["verify_aud"] = False
            decode_kwargs["options"] = options

        payload = jwt.decode(token, **decode_kwargs)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token subject missing")

        return {
            "token": token,
            "user_id": user_id,
            "payload": payload,
        }
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


def fetch_clerk_user(user_id: str) -> Optional[dict]:
    if not CLERK_SECRET_KEY:
        print("[clerk] CLERK_SECRET_KEY missing; skipping user lookup")
        return None

    user_url = f"{CLERK_API_BASE}/users/{user_id}"
    req = request.Request(
        user_url,
        headers={
            "Authorization": f"Bearer {CLERK_SECRET_KEY}",
            "Accept": "application/json",
        },
    )

    try:
        with request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except error.HTTPError as exc:
        print(f"[clerk] user lookup failed ({exc.code}) for {user_id}")
    except Exception as exc:
        print(f"[clerk] user lookup error for {user_id}: {exc}")
    return None


def extract_username_from_user(user: Optional[dict], user_id: str) -> str:
    if not user:
        return user_id

    username = user.get("username")
    if isinstance(username, str) and username.strip():
        return username.strip()

    return user_id


@app.post("/api/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    interview_video: Optional[UploadFile] = File(None),
    auth_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """
    Upload a candidate's resume, save it with Clerk user id as filename,
    store in database, and return analysis results.
    """
    try:
        candidate_id = auth_data["user_id"]
        # print("[auth_data] fields:", list(auth_data.keys()))
        # for key, value in auth_data.items():
        #     print(f"[auth_data] {key}: {value}")
        clerk_user = fetch_clerk_user(candidate_id)
        username = extract_username_from_user(clerk_user, candidate_id)
        
        # Get file extension
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        # Validate file type
        allowed_extensions = [".pdf", ".png", ".jpg", ".jpeg", ".bmp", ".webp", ".txt", ".docx"]
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}",
            )

        # Save file as resumes/<candidate_id>.<extension>
        file_path = os.path.join(RESUMES_DIR, f"{candidate_id}{file_extension}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        interview_video_path = None
        if interview_video and interview_video.filename:
            video_extension = os.path.splitext(interview_video.filename)[1].lower()
            allowed_video_extensions = [".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"]
            if video_extension not in allowed_video_extensions:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid video type. Allowed: {', '.join(allowed_video_extensions)}",
                )

            interview_video_path = os.path.join(INTERVIEWS_DIR, f"{candidate_id}{video_extension}")
            with open(interview_video_path, "wb") as video_buffer:
                shutil.copyfileobj(interview_video.file, video_buffer)

        # Read and analyze resume
        resume_text = read_resume(file_path)
        company_text = _load_global_company_text()
        analysis, processed_resume_text = analyze_resume(resume_text, candidate_id, company_text=company_text)
        
        # Extract name from analysis
        candidate_name = analysis.get("name", "Unknown")

        # Save to database (update if exists, create if not)
        candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
        if candidate:
            candidate.username = username
            candidate.name = candidate_name
            candidate.resume_text = processed_resume_text
            candidate.analysis = analysis
        else:
            candidate = Candidate(
                candidate_id=candidate_id,
                username=username,
                name=candidate_name,
                resume_text=processed_resume_text,
                analysis=analysis
            )
            db.add(candidate)
        
        db.commit()
        db.refresh(candidate)

        return {
            "message": "Resume uploaded and analyzed successfully",
            "file_path": file_path,
            "interview_video_path": interview_video_path,
            "analysis": analysis,
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/api/resume/{candidate_id}")
async def get_resume_analysis(
    candidate_id: str,
    auth_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Get resume analysis for a specific candidate"""
    try:
        token_candidate_id = auth_data["user_id"]
        if candidate_id != token_candidate_id:
            raise HTTPException(status_code=403, detail="Access denied for this candidate_id")

        candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
        if not candidate or not candidate.analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")

        image_path = os.path.join(OUTPUT_IMAGES_DIR, f"{candidate_id}.png")
        if not os.path.exists(image_path):
            raise HTTPException(status_code=404, detail="Resume image not found")

        return {
            "candidate_id": candidate_id,
            "file_path": image_path,
            "analysis": candidate.analysis,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/api/candidates/search")
async def search_candidates(
    q: str,
    auth_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Search candidates by candidate_id, username, or name
    Returns list of matching candidates from database
    """
    try:
        # Search by candidate_id, username, or name
        candidates = db.query(Candidate).filter(
            (Candidate.candidate_id == q) | 
            (Candidate.username.ilike(f"%{q}%")) | 
            (Candidate.name.ilike(f"%{q}%"))
        ).all()
        
        if not candidates:
            raise HTTPException(status_code=404, detail="No candidates found")
        
        return {
            "results": [
                ({
                    "candidate_id": c.candidate_id,
                    "username": c.username,
                    "name": c.name,
                    "analysis": c.analysis,
                })
                for c in candidates
            ],
            "count": len(candidates)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.post("/api/recruiter/upload-company-document")
async def upload_company_document(
    file: UploadFile = File(...),
):
    """
    Upload recruiter company context document.
    Saves file as company_docs/current_company_doc.<extension> and extracted text as company_docs/current_company_doc.txt
    """
    try:
        file_extension = os.path.splitext(file.filename)[1].lower()
        allowed_extensions = [".pdf", ".png", ".jpg", ".jpeg", ".bmp", ".webp", ".txt", ".docx"]
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}",
            )

        file_path = _company_doc_file_path(file_extension)

        # Ensure only one canonical company doc exists at a time.
        for existing in os.listdir(COMPANY_DOCS_DIR):
            if existing.startswith("current_company_doc") and existing != os.path.basename(file_path):
                try:
                    os.remove(os.path.join(COMPANY_DOCS_DIR, existing))
                except Exception:
                    pass

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extracted_text = read_resume(file_path)
        extracted_text = clean_extracted_text(extracted_text)
        text_path = _company_doc_text_path("")
        with open(text_path, "w", encoding="utf-8") as text_file:
            text_file.write(extracted_text)

        return {
            "message": "Company document uploaded successfully",
            "file_path": file_path,
            "text_path": text_path,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Company document upload failed: {str(e)}")


@app.get("/api/candidates/{candidate_id}/full-analysis")
async def get_candidate_full_analysis(
    candidate_id: str,
    auth_data: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """
    Get candidate's full analysis including resume image
    Requires authentication - users can only access their own data
    """
    try:
        token_candidate_id = auth_data["user_id"]
        if candidate_id != token_candidate_id:
            raise HTTPException(status_code=403, detail="Access denied: You can only view your own analysis")
        
        # Get candidate from database
        candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found in database")
        
        image_path = os.path.join(OUTPUT_IMAGES_DIR, f"{candidate_id}.png")
        if not image_path:
            raise HTTPException(status_code=404, detail="Resume image not found")
        if not os.path.exists(image_path):
            raise HTTPException(status_code=404, detail="Resume image not found")
        
        return {
            "candidate_id": candidate.candidate_id,
            "username": candidate.username,
            "name": candidate.name,
            "analysis": candidate.analysis,
            "resume_image_url": f"/api/candidates/{candidate_id}/resume-image",
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analysis: {str(e)}")


@app.get("/api/candidates/{candidate_id}/resume-image")
async def get_resume_image(
    candidate_id: str,
    auth_data: dict = Depends(verify_token)
):
    """
    Serve the resume image for a candidate
    Requires authentication - users can only access their own image
    """
    try:
        token_candidate_id = auth_data["user_id"]
        if candidate_id != token_candidate_id:
            raise HTTPException(status_code=403, detail="Access denied: You can only view your own resume")
        
        image_path = os.path.join(OUTPUT_IMAGES_DIR, f"{candidate_id}.png")
        if not image_path:
            raise HTTPException(status_code=404, detail="Resume image not found")
        if not os.path.exists(image_path):
            raise HTTPException(status_code=404, detail="Resume image not found")
        
        return FileResponse(image_path, media_type="image/png")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get image: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)