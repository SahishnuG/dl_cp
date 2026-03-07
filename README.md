# Full-Stack Resume Analysis Platform

## Overview

This is a comprehensive full-stack application for candidate resume analysis and evaluation. It combines a FastAPI backend with advanced NLP capabilities and a Next.js frontend with interactive visualizations.

## Architecture

### Backend Stack
- **FastAPI 0.104+** - REST API with JWT authentication and file upload handling
- **PostgreSQL 13+** - Candidate database with Docker containerization
- **SQLAlchemy 2.0+** - ORM with User model (UUID, email, hashed passwords, timestamps)
- **Passlib + Bcrypt 4.0.1** - Password hashing with 72-byte UTF-8 truncation safety
- **Python-Jose + HS256** - JWT token generation (30-min expiry)
- **GOT-OCR 2.0 (stepfun-ai)** - Vision-language model for resume text extraction
- **BERT-base-NER (dslim)** - Token classification for named entity recognition
- **Transformers + PyTorch** - Deep learning framework with CUDA 12.1 support

### Frontend Stack
- **Next.js 16.1.6** - React framework with SSR and routing
- **React 19.2.3** - UI library
- **Tailwind CSS 4** - Utility-first styling
- **Recharts 3.7.0** - Data visualization (pie charts)
- **TypeScript 5+** - Static type checking

### Infrastructure
- **Docker + docker-compose** - PostgreSQL containerization
- **pgAdmin** - Database visualization (http://localhost:5050)
- **Uvicorn** - ASGI server for FastAPI

## Quick Start

### Prerequisites
- Docker & Docker Desktop
- Python 3.9+ with uv package manager
- Node.js 18+ with npm
- Poppler (for PDF processing): Windows path `D:\Program Files\poppler-25.12.0\Library\bin`

### Setup

1. **Backend Setup**
    ```
    see README.md in backend/
    ```

2. **Database Setup**
   ```bash
   docker-compose up -d  # Starts PostgreSQL + pgAdmin
   # Access pgAdmin at http://localhost:5050
   # Default credentials: admin@admin.com / admin
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev  # Starts Next.js dev server on localhost:3000
   ```

## API Endpoints

### Authentication
- `POST /api/register` - Register new candidate
  ```json
  {
    "email": "user@example.com",
    "password": "securepass123",
    "full_name": "John Doe"
  }
  ```

- `POST /api/login` - Authenticate candidate
  ```json
  {
    "email": "user@example.com",
    "password": "securepass123"
  }
  ```

### Resume Operations
- `POST /api/upload-resume` - Upload and analyze resume (requires Bearer token)
  - Accepts: PDF, DOCX, TXT, PNG, JPG, BMP, WEBP
  - Returns: Extracted text + analysis (name, email, position, scores, strengths, weaknesses)

- `GET /api/resume/{candidate_id}` - Retrieve stored resume analysis (requires Bearer token)

### Health
- `GET /health` - Service health check

## Key Features

### Authentication Flow
1. User selects role (candidate/recruiter) on home page
2. Candidate registers/logs in with email + password
3. JWT token stored in localStorage
4. Protected endpoints require `Authorization: Bearer <token>` header

### Resume Analysis Pipeline
1. **File Upload**: Multi-format support (PDF, DOCX, TXT, images)
2. **OCR Extraction**: GOT-OCR 2.0 converts resume to text
3. **NER Processing**: BERT-base-NER extracts entities (name, position, experience)
4. **Scoring Algorithm**:
   - **Technical** (0-100): Based on tech keywords detected
   - **Cultural** (0-100): Based on soft-skill keywords
   - **Growth** (0-100): Based on education/certifications
   - **Overall**: Weighted average (40% technical, 30% cultural, 30% growth)
5. **Classification**: Strong Fit (≥75) | Trainable Fit (≥50) | Risky Fit (<50)

### Password Security
- Minimum 8 characters
- Hashed with bcrypt via Passlib
- **UTF-8 safe truncation** to 72 bytes before hashing (accommodates multi-byte characters)
- Truncation applied consistently in both `hash_password()` and `verify_password()`

### Email Validation
- Single source of truth: Pydantic `EmailStr` (RFC 5322 compliant)
- Validated at API request boundary

## File Structure

### Backend
```
backend/
├── main.py                 # FastAPI app with 5 endpoints
├── config/
│   └── settings.py         # GOT-OCR model lazy loading
├── src/
│   ├── helper_funcs.py     # Auth, OCR, NER, database models
│   ├── db_test.py          # Database introspection utility
│   └── cuda_test.py        # GPU availability check
├── resumes/                # Candidate resume storage (<candidate_id>.<ext>)
└── pyproject.toml          # Python dependencies
```

### Frontend
```
frontend/
├── app/
│   ├── page.tsx            # Home/role selection
│   ├── candidate-login/    # Auth form
│   ├── upload/             # Resume upload with drag-drop
│   ├── dashboard/          # Recruiter stats dashboard
│   └── candidates/         # Candidate search
├── components/             # Reusable React components
│   ├── Navbar.tsx
│   ├── ThemeProvider.tsx
│   ├── ParticleBackground.tsx
│   ├── DashboardStats.tsx
│   ├── ResumeChart.tsx
│   ├── CandidateSearch.tsx
│   └── CandidateReport.tsx
└── package.json
```

## Database Schema

### Users Table
```
id: UUID (PRIMARY KEY)
email: VARCHAR UNIQUE NOT NULL
hashed_password: VARCHAR NOT NULL
full_name: VARCHAR NULLABLE
is_active: BOOLEAN DEFAULT true
created_at: TIMESTAMP
last_login: TIMESTAMP NULLABLE
```

## Frontend Features

### Dark Mode
- System preference detection
- Manual toggle in navbar
- Persists to localStorage
- Smooth transitions

### Particle Background
- Interactive canvas animation (~1 particle per 12000 screen pixels)
- Repels particles from cursor (200px influence radius)
- Spawns 25-particle burst on click
- Theme-aware colors (light/dark)

### Responsive Design
- Mobile-first Tailwind CSS
- Adaptive layouts (flex column on mobile, row on desktop)
- Touch-friendly drag-drop upload interface

## Common Issues & Solutions

### ImportError: No module named 'config'
```bash
# Use with PYTHONPATH when running backend scripts
PYTHONPATH=$(pwd) uv run src/db_test.py
```

### Bcrypt version incompatibility
```bash
# Install pinned version
uv pip install "bcrypt==4.0.1"
```

### Poppler path not found
- Update hardcoded path in `helper_funcs.py` (line ~80)
- Windows: `D:\Program Files\poppler-25.12.0\Library\bin`
- Linux: Install via `apt-get install poppler-utils`

### BERT pooler warnings
- Safe to ignore when loading `dslim/bert-base-NER`
- Token classification pipeline doesn't use pooler weights

### CORS errors from frontend
- Currently allows all origins (`allow_origins=["*"]`)
- For production: Update to frontend domain only

## Testing the Complete Flow

1. **Signup**
   ```bash
   curl -X POST http://localhost:8000/api/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:8000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. **Upload Resume** (with token from login response)
   ```bash
   curl -X POST http://localhost:8000/api/upload-resume \
     -H "Authorization: Bearer <ACCESS_TOKEN>" \
     -F "file=@resume.pdf" \
     -F "candidate_id=<USER_ID>"
   ```

## Environment Configuration

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resume_db
JWT_SECRET_KEY=your-secret-key-here
GOT_MODEL_ID=stepfun-ai/GOT-OCR-2.0-hf
NER_MODEL_ID=dslim/bert-base-NER
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Performance Considerations

### Backend
- GOT-OCR 2.0: ~5-10 seconds per resume (GPU: fp16, CPU: fp32)
- BERT-NER: ~500ms per resume
- Model weights loaded once on startup (lazy initialization in Settings)

### Frontend
- Next.js static generation for home page
- Client-side rendering for authenticated routes
- Particle background: ~60fps on modern browsers (CPU-intensive)

## Security Considerations

- **Passwords**: Bcrypt hashing with 72-byte truncation (UTF-8 safe)
- **Tokens**: HS256 JWT with 30-minute expiry (implemented in `create_access_token()`)
- **File Upload**: Validates MIME type and extension in frontend + backend
- **CORS**: Currently `allow_origins=["*"]` (update for production)
- **Password Min Length**: 8 characters enforced in `register_candidate()`

## Future Enhancements

- [ ] Refresh token logic (current: 30-min expiry only)
- [ ] Email verification on signup
- [ ] Password reset flow
- [ ] Real-time candidate search from database
- [ ] Resume comparison features
- [ ] Production deployment (Docker images, CI/CD)
- [ ] Rate limiting on API endpoints
- [ ] Recruiter dashboard with real data integration

## Technologies & Versions

| Component | Version |
|-----------|---------|
| Python | 3.9+ |
| FastAPI | 0.104+ |
| PostgreSQL | 13+ |
| Node.js | 18+ |
| Next.js | 16.1.6 |
| React | 19.2.3 |
| TypeScript | 5+ |
| PyTorch | Latest (CUDA 12.1) |
| Transformers | Latest |

## License

MIT

## Support

For issues or questions, check the `.py` and `.tsx` files for inline comments explaining key logic sections.
