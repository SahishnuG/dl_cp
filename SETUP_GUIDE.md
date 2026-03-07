# Karmafit - Complete Setup Guide

## 🎯 Authentication Flow

### Flow Diagram
```
1. User visits homepage (/)
   ↓
2. Chooses role: Candidate or Recruiter
   ↓
3a. Candidate Path:               3b. Recruiter Path:
    - Login/Signup                    - Direct to Dashboard
    - Upload Resume                   - View Analytics
    - Get Analysis                    - Search Candidates
```

## 🚀 Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
pip install -e .
# or with uv
uv pip install -e .
```

#### Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Generate a secure SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Update .env with the generated key
```

#### Start PostgreSQL Database
```bash
# From project root
cd ..
docker-compose up -d

# Verify it's running
docker ps
```

#### Start Backend Server
```bash
cd backend
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

### 2. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
# or
pnpm install
# or
yarn install
```

#### Start Development Server
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Frontend will be available at: http://localhost:3000

## 📋 Features Implemented

### Frontend Pages

1. **Home Page** (`/`)
   - Role selection: Candidate or Recruiter
   - Beautiful gradient UI with hover effects

2. **Candidate Login/Signup** (`/candidate-login`)
   - Toggle between login and signup
   - Email validation
   - Password requirements (min 8 chars)
   - JWT token storage

3. **Resume Upload** (`/upload`)
   - Drag & drop file upload
   - File type validation
   - Supported formats: PDF, PNG, JPG, BMP, WEBP, TXT, DOCX
   - Authentication required
   - Instant analysis after upload

4. **Dashboard** (`/dashboard`) - For Recruiters
   - Analytics overview
   - Candidate statistics

5. **Candidate Search** (`/candidates`) - For Recruiters
   - Search and filter candidates

### Backend Endpoints

#### Authentication
- `POST /api/register` - Register new candidate
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }
  ```

- `POST /api/login` - Login candidate
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

#### Resume Management
- `POST /api/upload-resume` - Upload and analyze resume
  - Requires: Bearer token, multipart/form-data
  - Saves as: `resumes/<candidate_id>.<extension>`
  - Returns: Resume analysis

- `GET /api/resume/{candidate_id}` - Get resume analysis
  - Requires: Bearer token

- `GET /health` - Health check

## 🗂️ File Storage

Resumes are stored in: `backend/resumes/`

Naming convention: `<candidate_id>.<extension>`

Examples:
- `resumes/123e4567-e89b-12d3-a456-426614174000.pdf`
- `resumes/550e8400-e29b-41d4-a716-446655440000.jpg`

## 🔐 Authentication Flow

### Registration
1. User signs up at `/candidate-login`
2. Backend validates email & password
3. Password is hashed with bcrypt
4. User saved to PostgreSQL
5. JWT token generated and returned
6. Frontend stores token in localStorage

### Login
1. User logs in at `/candidate-login`
2. Backend verifies credentials
3. JWT token generated
4. Token stored in localStorage
5. User redirected to `/upload`

### Protected Routes
- Upload page requires valid token
- Token sent in `Authorization: Bearer <token>` header
- Backend validates token on each request

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,           -- UUID
    email VARCHAR UNIQUE NOT NULL,    -- User email
    hashed_password VARCHAR NOT NULL, -- Bcrypt hash
    full_name VARCHAR,                -- Optional name
    is_active BOOLEAN DEFAULT TRUE,   -- Account status
    created_at TIMESTAMP,             -- Registration time
    last_login TIMESTAMP              -- Last login time
);
```

## 🧪 Testing the Flow

### Test Candidate Registration & Resume Upload

```bash
# 1. Start services
docker-compose up -d
cd backend && python main.py

# 2. In another terminal
cd frontend && npm run dev

# 3. Open browser: http://localhost:3000

# 4. Click "I'm a Candidate"

# 5. Sign up with:
Email: test@example.com
Password: password123
Name: Test User

# 6. Upload a resume (any supported format)

# 7. View analysis results
```

### Test Recruiter Access

```bash
# 1. Open: http://localhost:3000
# 2. Click "I'm a Recruiter"
# 3. Access dashboard directly
```

## 🔧 API Testing with cURL

### Register
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Upload Resume
```bash
TOKEN="your-jwt-token-here"
CANDIDATE_ID="your-candidate-id-here"

curl -X POST "http://localhost:8000/api/upload-resume" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/resume.pdf" \
  -F "candidate_id=$CANDIDATE_ID"
```

## 📁 Project Structure

```
dl_cp/
├── backend/
│   ├── main.py                  # FastAPI app with endpoints
│   ├── config/
│   │   └── settings.py         # Model & processor settings
│   ├── src/
│   │   └── helper_funcs.py     # Auth & analysis functions
│   ├── resumes/                # Uploaded resumes storage
│   ├── .env                    # Environment variables
│   └── pyproject.toml          # Python dependencies
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Home (role selection)
│   │   ├── candidate-login/    # Login/signup page
│   │   ├── upload/             # Resume upload page
│   │   ├── dashboard/          # Recruiter dashboard
│   │   └── candidates/         # Candidate search
│   └── components/             # Reusable components
│
└── docker-compose.yml          # PostgreSQL setup
```

## 🛠️ Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps

# View logs
docker logs karmafit_postgres

# Restart database
docker-compose restart postgres
```

### Token Errors
- Clear localStorage in browser DevTools
- Re-login to get new token

### File Upload Issues
- Check file size (large files may timeout)
- Verify file extension is supported
- Check backend logs for errors

### CORS Errors
- Ensure backend is running on port 8000
- Frontend should be on port 3000
- Check CORS configuration in main.py

## 🚀 Production Deployment

### Backend
1. Update CORS origins in main.py
2. Set strong SECRET_KEY in .env
3. Use PostgreSQL (not Docker) in production
4. Enable HTTPS
5. Add rate limiting
6. Implement refresh tokens

### Frontend
1. Update API URL from localhost
2. Build: `npm run build`
3. Deploy to Vercel/Netlify
4. Set environment variables

## 📝 Next Steps

- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add file size limits
- [ ] Create candidate profile page
- [ ] Add resume download endpoint
- [ ] Implement refresh tokens
- [ ] Add rate limiting
- [ ] Create admin panel
- [ ] Add resume comparison feature
- [ ] Export analysis as PDF

## 💡 Tips

- Keep backend and frontend running in separate terminals
- Check browser console for frontend errors
- Check terminal for backend errors
- Use pgAdmin (http://localhost:5050) to view database
- Test API endpoints with FastAPI docs (http://localhost:8000/docs)
