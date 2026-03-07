# Karmafit - Resume Analysis & Candidate Screening Platform

## Overview

Karmafit is a full-stack intelligent resume analysis and candidate screening platform. It combines a FastAPI backend with advanced OCR/NLP capabilities and a Next.js frontend featuring real-time candidate analytics, resume search, and comprehensive analysis dashboards.

## Architecture

### Backend Stack
- **FastAPI 0.104+** - REST API with Clerk JWT verification and file handling
- **PostgreSQL 15+** - Candidate data persistence with Docker containerization
- **SQLAlchemy 2.0+** - ORM with Candidate model (candidate_id, username, resume_text, analysis JSON)
- **PyJWT + RS256** - Clerk JWKS-based token verification (no secrets needed, public keys only)
- **GOT-OCR 2.0** - Vision-language model for multi-format resume OCR (PDF, DOCX, TXT, images)
- **BERT-base-NER** - Named entity recognition for structured data extraction
- **PyTorch + CUDA 12.1** - Deep learning with GPU acceleration

### Frontend Stack
- **Next.js 16.1.6** - React framework with SSR, dynamic routing, API integration
- **React 19.2.3** - UI library with hooks
- **@clerk/nextjs 6.39.0** - Managed authentication & session handling
- **Tailwind CSS 4** - Utility-first responsive styling
- **Recharts 3.7.0** - Interactive data visualization
- **TypeScript 5+** - Type-safe development

### Infrastructure
- **Docker + docker-compose** - PostgreSQL + pgAdmin containerization
- **Uvicorn** - ASGI server for FastAPI
- **npm/Node.js** - Frontend package management

## Quick Start

### Prerequisites
- Docker & Docker Desktop
- Python 3.10+ with uv package manager
- Node.js 18+ with npm
- Poppler (PDF processing): Windows `D:\Program Files\poppler-25.12.0\Library\bin`
- Clerk account (https://clerk.com) with API keys

### Setup

1. **Environment Configuration**

   Create `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/karmafit_db
   CLERK_JWKS_URL=https://your-clerk-domain/.well-known/jwks.json
   CLERK_ISSUER=https://your-clerk-domain
   CLERK_AUDIENCE=your-audience
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

2. **Database Setup**
   ```bash
   docker-compose up -d
   ```
   - PostgreSQL on `5432`
   - pgAdmin on `5050` (admin@karmafit.com / admin)

3. **Backend Setup**
   ```bash
   cd backend
   uv sync
   uv pip install torch --index-url https://download.pytorch.org/whl/cu121
   uv run main.py
   ```
   API runs on `http://localhost:8000`

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

## API Endpoints

### Authentication (Clerk-managed)
- All endpoints require `Authorization: Bearer <clerk_jwt>` header
- Token obtained via `@clerk/nextjs` on frontend

### Resume Operations
- `POST /api/upload-resume` - Upload resume, extract text, store analysis
  - Accepts: PDF, DOCX, TXT, PNG, JPG, BMP, WEBP
  - Returns: Analysis object with scores, skills, classification

- `GET /api/resume/{candidate_id}` - Retrieve analysis from database

- `GET /api/candidates/search?q={id_or_username}` - Search by Clerk ID or username

- `GET /api/candidates/{candidate_id}/full-analysis` - Get analysis + image URL

- `GET /api/candidates/{candidate_id}/resume-image` - Serve resume preview image

### Health
- `GET /health` - Service health check

## Key Features

### Authentication & Authorization
- **Clerk OAuth**: Sign up/login via email, OAuth2, or passkeys
- **JWT Verification**: Backend validates Clerk JWKS tokens (RS256)
- **User Identity**: `candidate_id` = Clerk `user.id` (persistent, immutable)
- **Session Management**: Frontend maintains Clerk session; tokens auto-refresh

### Resume Analysis Pipeline
1. **Multi-Format Upload**: PDF, DOCX, TXT, image files
2. **OCR Extraction**: GOT-OCR 2.0 converts any format → high-quality text
3. **NER Processing**: BERT-base-NER extracts name, position, experience, contact
4. **Skill Detection**: Regex + keyword matching for 50+ tech/soft skills
5. **Scoring**:
   - **Technical** (0-100): Tech skills density
   - **Cultural** (0-100): Soft skill indicators
   - **Growth** (0-100): Education + certifications
   - **Overall**: 40% technical, 30% cultural, 30% growth
6. **Classification**: Strong Fit (≥75) | Trainable Fit (≥50) | Risky Fit (<50)

### Database Persistence
- **Candidates Table**: Stores `candidate_id`, `username`, `resume_text`, `analysis` (JSON)
- **Auto-initialize**: Tables created on first backend startup
- **Update Logic**: Resume re-upload upserts candidate record + image

### Dashboard & Analytics
- **My Analysis Page**: Personal resume preview, scores, strengths/weaknesses
- **Candidate Search**: Query by Clerk ID or username, view analysis
- **Responsive Charts**: Score breakdowns with interactive visualizations

## File Structure

### Backend
```
backend/
├── main.py                 # FastAPI app, 6 endpoints, Clerk auth
├── src/
│   ├── database.py         # SQLAlchemy models, session management
│   ├── helper_funcs.py     # OCR, NER, analysis scoring
│   ├── cuda_test.py        # GPU availability check
│   └── __pycache__/
├── config/
│   └── settings.py         # Model lazy loading, CUDA setup
├── resumes/                # Resume file storage
├── output_images/          # Generated resume preview images (.png)
└── pyproject.toml
```

### Frontend
```
frontend/
├── app/
│   ├── page.tsx                # Home (role selection)
│   ├── layout.tsx              # ClerkProvider wrapper
│   ├── candidate-login/        # Clerk SignIn component
│   ├── sign-up/                # Clerk SignUp component
│   ├── upload/                 # Resume upload interface
│   ├── dashboard/              # Recruiter stats
│   ├── candidates/             # Candidate search
│   └── analysis/               # Personal analysis (My Analysis tab)
├── components/
│   ├── Navbar.tsx              # Navigation with theme toggle
│   ├── CandidateSearch.tsx     # Search form + real API call
│   ├── CandidateReport.tsx     # Analysis display
│   └── ...others
├── package.json
└── tsconfig.json
```

## Database Schema

### Candidates Table
```sql
candidate_id VARCHAR PRIMARY KEY       -- Clerk user.id
username VARCHAR INDEXED               -- Derived from Clerk email
resume_text TEXT                       -- Full OCR-extracted text
analysis JSON                          -- Complete analysis object
```

## Frontend Features

### Authentication Flow
1. User selects candidate/recruiter role on home page
2. Clicks "Sign In" → Clerk modal (email, OAuth, passkey)
3. On signup, Clerk creates `user.id` (stable across sessions)
4. Frontend stores Clerk session; API requests include JWT in header
5. Backend validates JWT via JWKS, extracts `user_id` from `sub` claim

### Analysis Dashboard
- **Resume Preview**: Generated .png image of resume
- **Score Breakdown**: Visual progress bars for technical/cultural/growth
- **Skills**: Color-coded badges for strengths and improvement areas
- **Classification**: Status badge (Strong/Trainable/Risky Fit)
- **Update Button**: Re-upload resume to refresh analysis

### Candidate Search
- Search by Clerk user ID or username
- Returns database-stored analysis
- Recruiter-accessible (role-based if needed)

### Responsive Design
- Mobile-first Tailwind CSS
- Dark mode with system preference detection
- Particle background animation on home page
- Drag-drop resume upload

## See Also
- **[Backend README](backend/README.md)** - Detailed setup, troubleshooting, CUDA/Poppler config
- **[Frontend README](frontend/README.md)** - Development, build, linting
- **[Database Guide](DATABASE_GUIDE.md)** - Schema, endpoints, flow diagrams

## Common Issues & Solutions

### "CLERK_JWKS_URL is not configured"
- Set `CLERK_JWKS_URL` in `backend/.env` (format: `https://your-domain/.well-known/jwks.json`)

### "Resume image not found" (404)
- Image is generated during upload; if missing, re-upload resume
- Check `backend/output_images/` directory for `{candidate_id}.png`

### Poppler PDF error
- Install Poppler: https://github.com/oschwartz10612/poppler-windows/releases
- Update path in `backend/src/helper_funcs.py` line ~28

### Docker PostgreSQL fails
- Ensure Docker Desktop is running
- Check port 5432 is not in use: `netstat -ano | findstr :5432`
- Reset: `docker-compose down -v && docker-compose up -d`

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
