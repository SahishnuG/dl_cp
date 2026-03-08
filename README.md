# Karmafit

Karmafit is a full-stack resume analysis platform with:

- `backend/`: FastAPI API for authentication, upload, OCR/NLP analysis, and candidate search
- `frontend/`: Next.js app for candidate upload/analysis and recruiter search/dashboard workflows

This root README is intentionally project-level. Service-specific setup, troubleshooting, and scripts are documented in each service README.

## Repository Layout

```text
.
├── backend/                # FastAPI service
├── frontend/               # Next.js service
├── docker-compose.yml      # Local PostgreSQL + pgAdmin
├── render.yaml             # Render deployment config
├── DATABASE_GUIDE.md       # Database-oriented guide
└── README.md               # This file
```

## Prerequisites

- Docker Desktop
- Python 3.10+
- `uv` package manager
- Node.js 18+
- npm

## Quick Start (Workspace)

1. Start local infrastructure:

```bash
docker-compose up -d
```

2. Configure service env files:

- Backend env: `backend/.env`
- Frontend env: `frontend/.env.local`

3. Run backend and frontend using their own READMEs:

- Backend guide: `backend/README.md`
- Frontend guide: `frontend/README.md`

## Environment Notes

- `CLERK_SECRET_KEY` is backend-only. Do not place it in frontend env files.
- `NEXT_PUBLIC_API_URL` must point frontend to your running backend URL.
- If using tunnels (for example, ngrok), ensure frontend points to the tunnel URL and backend CORS/headers are configured accordingly.

## Service Documentation

- Backend setup and troubleshooting: `backend/README.md`
- Frontend setup and scripts: `frontend/README.md`
- Database details: `DATABASE_GUIDE.md`

## Common Local Commands

From repository root:

```bash
docker-compose up -d
docker-compose down
docker-compose logs -f postgres
```

From `backend/`:

```bash
uv run --no-sync python main.py
```

From `frontend/`:

```bash
npm run dev
```

## Deployment

- Render configuration: `render.yaml`
- Keep secrets in platform env vars (not committed files)

## Note

If a detail in this README conflicts with a service README, treat the service README as the source of truth for that service.
| TypeScript | 5+ |
| PyTorch | Latest (CUDA 12.1) |
| Transformers | Latest |

## License

MIT

## Support

For issues or questions, check the `.py` and `.tsx` files for inline comments explaining key logic sections.
