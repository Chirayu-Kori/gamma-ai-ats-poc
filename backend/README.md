# Gamma ATS POC — FastAPI backend

Provides resume parsing (Gemini multimodal), streaming generation (SSE),
custom theme synthesis, and JSON-in-txt file storage.

## Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# edit .env -> set GEMINI_API_KEY
```

## Run

```powershell
uvicorn main:app --reload --port 8000
```

Health check: <http://localhost:8000/healthz>

## Storage

Resume records are stored as JSON inside `.txt` files:

```
backend/data/resumes/<resume_id>.txt
```

Uploads are not retained — they are read into memory, passed to Gemini, and
discarded. Toggle on `services/storage.save_upload` if you want raw bytes kept.

## Endpoints

| Method | Path                       | Purpose                                |
| ------ | -------------------------- | -------------------------------------- |
| POST   | `/api/resumes/parse`       | Upload PDF/image (+ optional JD) → parsed Resume JSON, draft record |
| POST   | `/api/resumes/generate`    | SSE stream of upgraded Resume JSON (accepts `resume_id`, inline resume, source text, JD) |
| GET    | `/api/resumes`             | List saved resumes (metadata)          |
| POST   | `/api/resumes`             | Create blank/seeded record             |
| GET    | `/api/resumes/{id}`        | Fetch full record                      |
| PUT    | `/api/resumes/{id}`        | Update record (autosave target)        |
| DELETE | `/api/resumes/{id}`        | Delete record                          |
| POST   | `/api/themes/generate`     | Synthesize theme tokens from prompt    |
