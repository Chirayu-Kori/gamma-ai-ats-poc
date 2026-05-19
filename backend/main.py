from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import ai_edit, generate, parse, resumes, themes

app = FastAPI(title="Gamma ATS POC API", version="0.1.0")

origins = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(parse.router)
app.include_router(generate.router)
app.include_router(resumes.router)
app.include_router(ai_edit.router)
app.include_router(themes.router)


@app.get("/healthz")
def healthz() -> dict:
    return {"ok": True}
