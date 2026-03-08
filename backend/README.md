# Karmafit Backend

## Project Overview

Karmafit is an intelligent resume analysis and candidate screening platform. The backend leverages advanced OCR (Optical Character Recognition) and deep learning technologies (like RoBERTa NER) to automatically extract structured data from resumes in multiple formats and provide candidate evaluation insights.

## Project Structure

```
backend/
├── main.py              # Main entry point for resume processing
├── pyproject.toml       # Project dependencies and configuration
├── README.md            # This file
├── config/
│   ├── settings.py      # Configuration and model initialization
│   └── __pycache__/     # Python cache
├── src/
│   ├── helper_funcs.py  # File conversion and utility functions
│   ├── cuda_test.py     # CUDA availability testing
│   └── __pycache__/     # Python cache
└── output_images/       # Directory for converted resume images
```

## How to Run

1. **Start PostgreSQL Database**:

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

2. **Configure Environment Variables**:
see .env.example and create a .env accordingly  

3. **Install dependencies**:
   ```
   uv sync
   ```

4. **Install PyTorch with CUDA support** (Windows):
   ```
   uv pip uninstall torch
   uv pip install torch --index-url https://download.pytorch.org/whl/cu121
   uv pip install torchvision --index-url https://download.pytorch.org/whl/cu121
   ```

5. **Run the application**:
   ```
   uv run --no-sync python main.py
   ```

## Troubleshooting

**Docker not installed**:
   - Download Docker Desktop if youre on windows and ensure its running

**uv not installed**:
   ```
   pip install uv
   ```

**poppler not installed**:
   - Download from: https://github.com/oschwartz10612/poppler-windows/releases/download/v25.12.0-0/Release-25.12.0-0.zip
   - Extract and note the installation path

**wrong poppler path**:
   - Update the poppler path in src/helper_funcs.py line 28
   - Change: `poppler_path=r"D:\Program Files\poppler-25.12.0\Library\bin"`
   - Or delete the `poppler_path` parameter if poppler is already in your system PATH

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