# Authentication Setup Guide

## 🚀 Quick Start

### 1. Start PostgreSQL Database

```bash
# From project root directory
docker-compose up -d
```

This will start:
- **PostgreSQL** on port `5432`
- **pgAdmin** (database GUI) on port `5050`

Access pgAdmin at http://localhost:5050:
- Email: `admin@karmafit.com`
- Password: `admin`

### 2. Install Python Dependencies

```bash
cd backend
pip install -e .
# or with uv
uv pip install -e .
```

### 3. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and update SECRET_KEY
# Generate a secure key with:
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 📝 Usage Examples

### Register a New Candidate

```python
from src.helper_funcs import register_candidate

# Register new user
result = register_candidate(
    email="john.doe@example.com",
    password="SecurePass123",
    full_name="John Doe"
)

print(result)
# Output:
# {
#     "id": "uuid-here",
#     "email": "john.doe@example.com",
#     "full_name": "John Doe",
#     "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#     "token_type": "bearer",
#     "message": "Registration successful"
# }
```

### Login Candidate

```python
from src.helper_funcs import login_candidate

# Login existing user
result = login_candidate(
    email="john.doe@example.com",
    password="SecurePass123"
)

print(result["access_token"])
# Use this token in Authorization header: Bearer <token>
```

## 🔒 Security Features

- ✅ **bcrypt** password hashing
- ✅ **JWT** token-based authentication
- ✅ Email validation
- ✅ Password strength validation (min 8 characters)
- ✅ Duplicate email prevention
- ✅ Account active status checking

## 🗄️ Database Schema

```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    full_name VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);
```

## 🔧 Database Management

### Stop Database
```bash
docker-compose down
```

### Reset Database (Delete all data)
```bash
docker-compose down -v
docker-compose up -d
```

### View Database Logs
```bash
docker-compose logs -f postgres
```

## 🌐 Integration with FastAPI

### Example FastAPI Endpoint

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.helper_funcs import register_candidate, login_candidate

app = FastAPI()

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = None

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/register")
async def register(request: RegisterRequest):
    try:
        result = register_candidate(
            email=request.email,
            password=request.password,
            full_name=request.full_name
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/login")
async def login(request: LoginRequest):
    try:
        result = login_candidate(
            email=request.email,
            password=request.password
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## 🔐 JWT Token Usage

Once you receive an access token, include it in API requests:

```python
import requests

token = "your-jwt-token-here"
headers = {"Authorization": f"Bearer {token}"}

response = requests.get(
    "http://localhost:8000/api/protected-route",
    headers=headers
)
```

## ⚠️ Production Checklist

- [ ] Change `SECRET_KEY` to a strong random string
- [ ] Update database credentials in docker-compose.yml
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS/SSL
- [ ] Implement rate limiting on auth endpoints
- [ ] Add email verification workflow
- [ ] Set up password reset functionality
- [ ] Configure CORS properly
- [ ] Use connection pooling for database
- [ ] Implement refresh tokens
