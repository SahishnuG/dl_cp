from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import shutil
from src.helper_funcs import (
    read_resume,
    analyze_resume,
    register_candidate,
    login_candidate,
)

app = FastAPI(
    title="Karmafit API",
    description="Resume Analysis API with Authentication",
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

# Create resumes directory if it doesn't exist
RESUMES_DIR = "resumes"
os.makedirs(RESUMES_DIR, exist_ok=True)


# Pydantic Models
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    access_token: str
    token_type: str
    message: str


class LoginResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    access_token: str
    token_type: str
    message: str


# Dependency to verify JWT token
async def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        # Token verification would go here - for now we'll trust it
        return token
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/api/register", response_model=RegisterResponse)
async def register_user(request: RegisterRequest):
    """Register a new candidate"""
    try:
        result = register_candidate(
            email=request.email,
            password=request.password,
            full_name=request.full_name,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@app.post("/api/login", response_model=LoginResponse)
async def login_user(request: LoginRequest):
    """Authenticate a candidate"""
    try:
        result = login_candidate(
            email=request.email,
            password=request.password,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@app.post("/api/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    candidate_id: str = None,
    token: str = Depends(verify_token),
):
    """
    Upload a candidate's resume, save it with candidate_id as filename,
    and return analysis results.
    """
    try:
        if not candidate_id:
            raise HTTPException(status_code=400, detail="candidate_id is required")

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

        # Read and analyze resume
        resume_text = read_resume(file_path)
        analysis = analyze_resume(resume_text, candidate_id)

        return {
            "message": "Resume uploaded and analyzed successfully",
            "file_path": file_path,
            "analysis": analysis,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/api/resume/{candidate_id}")
async def get_resume_analysis(candidate_id: str, token: str = Depends(verify_token)):
    """Get resume analysis for a specific candidate"""
    try:
        # Find resume file with any allowed extension
        allowed_extensions = [".pdf", ".png", ".jpg", ".jpeg", ".bmp", ".webp", ".txt", ".docx"]
        file_path = None
        
        for ext in allowed_extensions:
            potential_path = os.path.join(RESUMES_DIR, f"{candidate_id}{ext}")
            if os.path.exists(potential_path):
                file_path = potential_path
                break
        
        if not file_path:
            raise HTTPException(status_code=404, detail="Resume not found")

        # Analyze resume
        resume_text = read_resume(file_path)
        analysis = analyze_resume(resume_text, candidate_id)

        return {
            "candidate_id": candidate_id,
            "file_path": file_path,
            "analysis": analysis,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)