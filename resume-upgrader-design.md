# Resume Upgrader — Technical Design Document

> A system that ingests an existing resume, uses an LLM to upgrade its content, renders it through swappable design templates, and lets the user edit every block inline. Gamma-style live streaming combined with Canva-style template variety, built on a DOM-based editor.

---

## 1. Overview

### 1.1 Problem statement

Users arrive with an existing resume (PDF, DOCX, or pasted text) and need two things from the system:

1. **Content upgrade** — the LLM rewrites bullets for impact, fixes weak phrasing, surfaces quantifiable achievements, and optionally tailors content to a target job description.
2. **Design upgrade** — the same upgraded content is rendered through multiple polished templates, switchable instantly without re-running the LLM.

The intended UX: paste or upload a resume, watch the upgraded version stream into the editor live (Gamma-style), edit any text inline as it lands, and try different templates with a single click.

### 1.2 Core design decisions

| Decision | Choice | Rationale |
|---|---|---|
| Rendering substrate | **DOM** (not Canvas/WebGL) | Native text editing, accessibility, print fidelity, free CSS layout. A resume is a structured document, not free-form design. |
| LLM output format | **Structured JSON** via Pydantic schema, streamed using tool_use | Every downstream layer (parser, store, renderer) operates on the same typed object. |
| State substrate | **Single Zustand store** holding a `Resume` object | One source of truth — streaming writes here, templates read here, editor mutates here. |
| Templates | **React components** consuming the same `Resume` type | Template swap = component swap; data is untouched. |
| Editor | **Tiptap** instances bound to JSON paths | Native contentEditable, undo, copy-paste, IME support — for free. |
| Transport | **Server-Sent Events (SSE)** | One-way streaming over plain HTTP, proxy-friendly, browser reconnect built in. |
| Export | **@react-pdf/renderer** or **Playwright headless Chromium** | Pixel-matching PDF from the same component tree. |

### 1.3 What we are explicitly NOT building

- A free-form drag-and-drop design tool (that's Canva's job; resumes are structured).
- A WYSIWYG canvas with absolute positioning (Konva.js, Fabric.js, Polotno are wrong for this).
- A general-purpose document editor (we constrain to the resume schema).

---

## 2. Architectural Principles

### 2.1 The schema is the only contract

The Pydantic `Resume` model is the **central artifact**. Backend produces it, transport carries it, store holds it, templates render it, editor mutates it, exporter re-renders it. Add a new section type = update the schema in one place + add a component. No other layer changes.

### 2.2 DOM-first rendering

The editor is HTML/CSS, not Canvas. This buys:

- Native text editing via `contentEditable` + Tiptap
- Spellcheck, IME, find-in-page, screen readers — all free
- CSS handles layout, reflow, page breaks, RTL
- Print to PDF preserves vector text and selection
- Standard React patterns work

The one trade-off: free-form absolute positioning is awkward. A resume doesn't need it.

### 2.3 Streaming as the default

The LLM emits the upgraded resume token by token. Every layer in the pipeline treats **partial versions** of the resume as first-class. The user sees content appear as it's generated rather than waiting for the full response.

### 2.4 Templates are pure presentation

A template is a React component that takes a `Resume` and renders it. Templates own *layout*, *typography*, and *color tokens*. Templates never own state and never mutate data.

---

## 3. Data Model

### 3.1 Pydantic schema

```python
# schemas/resume.py
from pydantic import BaseModel, Field
from typing import Literal

class ContactInfo(BaseModel):
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    linkedin: str | None = None
    github: str | None = None
    website: str | None = None

class Bullet(BaseModel):
    text: str
    impact_score: int | None = Field(None, ge=1, le=5)
    keywords: list[str] = []

class Experience(BaseModel):
    company: str
    title: str
    start: str                    # "YYYY-MM"
    end: str | None = None        # None = present
    location: str | None = None
    bullets: list[Bullet]

class Education(BaseModel):
    institution: str
    degree: str
    field: str | None = None
    start: str | None = None
    end: str | None = None
    gpa: str | None = None
    highlights: list[str] = []

class SkillGroup(BaseModel):
    category: str                 # "Languages", "Frameworks", "Tools"
    items: list[str]

class Project(BaseModel):
    name: str
    description: str
    url: str | None = None
    tech_stack: list[str] = []
    bullets: list[Bullet] = []

class Resume(BaseModel):
    name: str
    headline: str                 # one-line tagline under the name
    contact: ContactInfo
    summary: str
    experience: list[Experience]
    education: list[Education]
    skills: list[SkillGroup]
    projects: list[Project] | None = None
    certifications: list[str] | None = None
```

### 3.2 Why this shape

- **Bullets as objects**, not strings, so we can attach metadata (impact score, keywords) without breaking changes later.
- **Skills as groups**, not a flat list, so templates can render them as a table or comma-separated by category.
- **Optional sections** (`projects`, `certifications`) so the schema fits both software engineers and other professions.
- **Field ordering matters for streaming.** `name`, `headline`, `contact`, `summary` come first so the user sees identity-level content within the first 200ms.

### 3.3 Schema evolution

The schema will change. Strategy:

- Always add fields as `Optional[...]` with defaults — old stored resumes stay valid.
- Persist the schema version alongside the data: `{ "version": 3, "data": {...} }`.
- Write a migration function `migrate_v2_to_v3(old) -> dict` for breaking changes; run on read.

---

## 4. System Architecture

### 4.1 Layer diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          BACKEND                            │
│                                                             │
│   ┌────────────┐    ┌────────────┐    ┌──────────────┐      │
│   │  Upload &  │ ─→ │  Build     │ ─→ │  LLM stream  │      │
│   │  parse     │    │  prompt    │    │  (Claude)    │      │
│   └────────────┘    └────────────┘    └──────┬───────┘      │
│                                              │              │
│                                              ↓              │
│                                       ┌──────────────┐      │
│                                       │  SSE         │      │
│                                       │  transport   │      │
│                                       └──────┬───────┘      │
└──────────────────────────────────────────────┼──────────────┘
                                               │ network
┌──────────────────────────────────────────────┼──────────────┐
│                         FRONTEND             ↓              │
│                                                             │
│   ┌────────────┐    ┌────────────┐    ┌──────────────┐      │
│   │  Partial   │ ─→ │  Zustand   │ ─→ │  Template    │      │
│   │  JSON parse│    │  store     │    │  render      │      │
│   └────────────┘    └────────────┘    └──────┬───────┘      │
│                          ↑                   │              │
│                          │                   ↓              │
│                          │             ┌──────────────┐     │
│                          └──────────── │  Edit layer  │     │
│                                        │  (Tiptap)    │     │
│                                        └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Layer responsibilities

| Layer | Responsibility | Tech |
|---|---|---|
| Upload & parse | Convert uploaded file to plain text | FastAPI, pypdf, python-docx |
| Build prompt | Inject schema and user content into the LLM call | Anthropic SDK |
| LLM stream | Generate structured JSON token by token | Claude Opus via tool_use |
| SSE transport | Stream JSON deltas to the browser | FastAPI StreamingResponse |
| Partial JSON parse | Build incremental Resume object from string fragments | `partial-json` (npm) |
| Zustand store | Hold canonical in-memory state | Zustand + Immer |
| Template render | Display Resume through chosen template | React |
| Edit layer | Allow inline edits, write back to store | Tiptap, dnd-kit |

---

## 5. Backend

### 5.1 Ingestion

```python
# api/ingestion.py
from fastapi import UploadFile, HTTPException
import pypdf, docx, io

MAX_FILE_BYTES = 5 * 1024 * 1024  # 5 MB

async def extract_text(file: UploadFile) -> str:
    data = await file.read()
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(413, "File too large")

    mime = file.content_type
    if mime == "application/pdf":
        return _extract_pdf(data)
    if mime in (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ):
        return _extract_docx(data)
    if mime == "text/plain":
        return data.decode("utf-8", errors="ignore")
    raise HTTPException(415, f"Unsupported type: {mime}")


def _extract_pdf(data: bytes) -> str:
    reader = pypdf.PdfReader(io.BytesIO(data))
    pages = [p.extract_text() or "" for p in reader.pages]
    text = "\n".join(pages).strip()
    if len(text) < 100:
        # Likely a scanned PDF — fall back to vision
        return _ocr_via_vision(data)
    return text


def _extract_docx(data: bytes) -> str:
    d = docx.Document(io.BytesIO(data))
    paragraphs = [p.text for p in d.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


def _ocr_via_vision(pdf_bytes: bytes) -> str:
    # Convert PDF pages to images, send to Claude vision for OCR
    # Implementation omitted — use pdf2image + Anthropic vision message
    ...
```

This layer's only job is "give me clean plain text." Don't try to structure here — that's the LLM's job.

For higher-fidelity parsing (tables, columns, formatting hints) consider `unstructured` or `pdfplumber`. For low-quality scans, vision-based OCR through Claude is more accurate than Tesseract.

### 5.2 Prompt construction with schema-as-tool

The cleanest way to force structured output from Claude is to define the schema as a tool and require its use. The model "calls" the tool with the resume as the argument.

```python
# api/llm.py
from anthropic import Anthropic
from schemas.resume import Resume

client = Anthropic()

UPGRADE_TOOL = {
    "name": "emit_resume",
    "description": "Return the upgraded resume conforming to the schema.",
    "input_schema": Resume.model_json_schema(),
}

SYSTEM_PROMPT = """You are an expert resume writer. Upgrade the provided resume:

- Rewrite bullets to lead with action verbs and quantify impact.
- Surface achievements over responsibilities.
- Remove clichés ("results-driven", "team player", "go-getter").
- Tailor phrasing to the target role if provided.
- Preserve all factual claims; never fabricate dates, employers, or numbers.
- Match the structure of the schema exactly.

Field ordering in the output should be: name, headline, contact, summary, experience, education, skills, projects, certifications.
"""


def build_user_message(raw_text: str, target_role: str | None) -> str:
    parts = [f"RAW RESUME:\n{raw_text}"]
    if target_role:
        parts.append(f"\nTARGET ROLE:\n{target_role}")
    return "\n\n".join(parts)
```

### 5.3 LLM streaming

```python
# api/llm.py (continued)
from typing import AsyncGenerator

async def stream_upgrade(
    raw_text: str,
    target_role: str | None,
) -> AsyncGenerator[str, None]:
    user_msg = build_user_message(raw_text, target_role)

    with client.messages.stream(
        model="claude-opus-4-5",
        max_tokens=8192,
        system=SYSTEM_PROMPT,
        tools=[UPGRADE_TOOL],
        tool_choice={"type": "tool", "name": "emit_resume"},
        messages=[{"role": "user", "content": user_msg}],
    ) as stream:
        for event in stream:
            if event.type == "content_block_delta":
                if event.delta.type == "input_json_delta":
                    yield event.delta.partial_json
```

What's happening: the model writes its tool argument (the Resume JSON) token by token. Each `partial_json` is a string fragment — not standalone valid JSON, but the concatenation eventually is. Tool input streaming gives cleaner partial output than free-form text completion.

### 5.4 SSE transport

```python
# api/routes.py
from fastapi import FastAPI, Body
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

app = FastAPI()

class UpgradeRequest(BaseModel):
    raw_text: str
    target_role: str | None = None

@app.post("/api/resumes/upgrade")
async def upgrade(req: UpgradeRequest):
    async def event_stream():
        try:
            async for fragment in stream_upgrade(req.raw_text, req.target_role):
                yield f"data: {json.dumps({'delta': fragment})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disables nginx buffering
        },
    )
```

**Why SSE over WebSocket:** the flow is one-way (server → client). SSE is plain HTTP — passes through CORS, proxies, and CDNs without special config. Browsers reconnect automatically on drop. WebSocket is justified only when collaborative editing is added later.

### 5.5 Persistence

PostgreSQL with `JSONB` for the resume document. Indexes on `user_id` for listing, plus a version table for history.

```sql
CREATE TABLE resumes (
    id          UUID PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id),
    data        JSONB NOT NULL,                -- the Resume object
    schema_ver  INT NOT NULL DEFAULT 1,
    template_id TEXT NOT NULL DEFAULT 'minimal',
    theme       JSONB NOT NULL DEFAULT '{}',   -- color/font overrides
    raw_source  TEXT,                          -- original parsed text
    title       TEXT,                          -- user-given name
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_resumes_user ON resumes(user_id);
CREATE INDEX idx_resumes_updated ON resumes(user_id, updated_at DESC);

CREATE TABLE resume_versions (
    id          UUID PRIMARY KEY,
    resume_id   UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    data        JSONB NOT NULL,
    label       TEXT,                          -- "before upgrade", "v2", etc.
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_versions_resume ON resume_versions(resume_id, created_at DESC);
```

Snapshot on every significant action: after the initial upgrade, on template switch, before destructive operations.

### 5.6 API reference

| Method | Path | Body / Params | Returns |
|---|---|---|---|
| `POST` | `/api/resumes/parse` | `multipart` file | `{ raw_text, parse_id }` |
| `POST` | `/api/resumes/upgrade` | `{ raw_text, target_role? }` | **SSE** stream of `Resume` JSON deltas |
| `POST` | `/api/resumes/{id}/sections/{section}/regenerate` | `{ instruction }` | **SSE** stream of one section's deltas |
| `POST` | `/api/resumes/{id}/bullets/rewrite` | `{ path, instruction }` | **SSE** stream of new bullet |
| `GET` | `/api/resumes/{id}` | — | `Resume` |
| `PUT` | `/api/resumes/{id}` | full `Resume` | `Resume` |
| `PATCH` | `/api/resumes/{id}` | RFC 6902 JSON Patch | `Resume` |
| `GET` | `/api/resumes/{id}/versions` | — | `Version[]` |
| `POST` | `/api/resumes/{id}/versions/{vid}/restore` | — | `Resume` |
| `GET` | `/api/templates` | — | `Template[]` |
| `POST` | `/api/resumes/{id}/export` | `{ format: "pdf" }` | `{ download_url }` |

Section-level rewrites matter. Users will want "rewrite this bullet to emphasize leadership" without regenerating the whole document. Design for that from day one.

---

## 6. Frontend

### 6.1 Streaming consumption

```javascript
// hooks/useResumeStream.js
import { useEffect, useRef } from "react";
import { parse, ALLOW_PARTIAL_OBJECT, ALLOW_PARTIAL_ARRAY, ALLOW_PARTIAL_STRING }
  from "partial-json";
import { useResumeStore } from "../stores/resumeStore";

const PARTIAL_FLAGS = ALLOW_PARTIAL_OBJECT | ALLOW_PARTIAL_ARRAY | ALLOW_PARTIAL_STRING;

export function useResumeStream() {
  const { setResume, setStatus } = useResumeStore();
  const bufferRef = useRef("");

  const start = async ({ rawText, targetRole }) => {
    bufferRef.current = "";
    setStatus("streaming");

    const res = await fetch("/api/resumes/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_text: rawText, target_role: targetRole }),
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let chunk = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunk += decoder.decode(value, { stream: true });

      // SSE frames are separated by \n\n
      const frames = chunk.split("\n\n");
      chunk = frames.pop();   // keep incomplete frame in buffer

      for (const frame of frames) {
        if (!frame.startsWith("data: ")) continue;
        const payload = frame.slice(6);
        if (payload === "[DONE]") {
          setStatus("editing");
          return;
        }
        const { delta, error } = JSON.parse(payload);
        if (error) { setStatus("error"); return; }
        bufferRef.current += delta;
        try {
          const partial = parse(bufferRef.current, PARTIAL_FLAGS);
          setResume(partial);
        } catch {
          // not enough JSON yet, wait for next chunk
        }
      }
    }
  };

  return { start };
}
```

Each frame's delta is concatenated to a running buffer. After every concatenation, `partial-json` parses what's available — even a half-written string is returned as the prefix received so far. The result is a `Partial<Resume>` that grows over time.

### 6.2 State store

```javascript
// stores/resumeStore.js
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { subscribeWithSelector } from "zustand/middleware";

export const useResumeStore = create(
  subscribeWithSelector(
    immer((set, get) => ({
      // Data
      resume: null,
      schemaVersion: 1,

      // UI state
      status: "idle",                  // idle | streaming | editing | saving | error
      selectedTemplate: "minimal",
      theme: {},                       // color/font overrides
      focusedPath: null,               // which field is being edited

      // Streaming
      setResume: (partial) => set((s) => { s.resume = partial; }),
      setStatus: (status) => set((s) => { s.status = status; }),

      // Editing
      updateField: (path, value) => set((s) => {
        setByPath(s.resume, path, value);
      }),

      // Template / theme
      setTemplate: (id) => set((s) => { s.selectedTemplate = id; }),
      setTheme: (patch) => set((s) => { Object.assign(s.theme, patch); }),
    })),
  ),
);

function setByPath(obj, path, value) {
  const keys = path.split(".");
  let node = obj;
  for (const k of keys.slice(0, -1)) {
    const next = isNaN(k) ? k : Number(k);
    node = node[next];
  }
  node[keys.at(-1)] = value;
}
```

The store is the **single source of truth**. Components read fine-grained slices to avoid unnecessary re-renders:

```javascript
// Good — only re-renders when this specific bullet changes
const text = useResumeStore(
  (s) => s.resume?.experience?.[expIdx]?.bullets?.[bulletIdx]?.text,
);
```

### 6.3 Template system

A template is a React component that consumes the `Resume` from the store. The template provides layout and theme tokens; data binding is via store hooks.

```jsx
// templates/MinimalTemplate.jsx
import { useResumeStore } from "../stores/resumeStore";
import { EditableText, EditableBulletList } from "../editor";

export function MinimalTemplate() {
  const resume = useResumeStore((s) => s.resume);
  if (!resume) return <ResumeSkeleton />;

  return (
    <article className="resume minimal-theme">
      <header>
        <EditableText path="name" as="h1" />
        <EditableText path="headline" as="p" className="muted" />
        <ContactBar contact={resume.contact} />
      </header>

      <Section title="Summary">
        <EditableText path="summary" as="p" />
      </Section>

      <Section title="Experience">
        {resume.experience?.map((exp, i) => (
          <ExperienceBlock key={i} index={i} />
        ))}
      </Section>

      <Section title="Education">
        {resume.education?.map((edu, i) => (
          <EducationBlock key={i} index={i} />
        ))}
      </Section>

      <Section title="Skills">
        {resume.skills?.map((group, i) => (
          <SkillsRow key={i} group={group} />
        ))}
      </Section>
    </article>
  );
}
```

Theme tokens are scoped via CSS variables:

```css
/* templates/minimal-theme.css */
.minimal-theme {
  --color-accent: #1a73e8;
  --font-heading: "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
  --spacing-section: 1.5rem;
  --max-width: 700px;
}

.minimal-theme h1 { font-size: 2rem; color: var(--color-accent); }
.minimal-theme h2 { font-size: 1.1rem; border-bottom: 1px solid #eee; }
```

To create a new template, write a new component with its own CSS file. Data binding is identical. Template registry:

```javascript
// templates/registry.js
import { MinimalTemplate } from "./MinimalTemplate";
import { ExecutiveTemplate } from "./ExecutiveTemplate";
import { ModernTemplate } from "./ModernTemplate";

export const TEMPLATES = {
  minimal:   { name: "Minimal",   Component: MinimalTemplate,   thumbnail: "/t/minimal.png" },
  executive: { name: "Executive", Component: ExecutiveTemplate, thumbnail: "/t/exec.png" },
  modern:    { name: "Modern",    Component: ModernTemplate,    thumbnail: "/t/modern.png" },
};
```

The root renderer just selects from the registry:

```jsx
function ResumeCanvas() {
  const templateId = useResumeStore((s) => s.selectedTemplate);
  const { Component } = TEMPLATES[templateId];
  return <Component />;
}
```

### 6.4 Edit layer

Each text-bearing element is a Tiptap instance bound to a JSON path. The editor reads from the store and writes back on every change, debounced for autosave.

```jsx
// editor/EditableText.jsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { useResumeStore } from "../stores/resumeStore";
import { useDebouncedAutosave } from "../hooks/useDebouncedAutosave";

export function EditableText({ path, as = "div", className }) {
  const value = useResumeStore((s) => getByPath(s.resume, path));
  const updateField = useResumeStore((s) => s.updateField);
  const triggerAutosave = useDebouncedAutosave();

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: false, bulletList: false })],
    content: value || "",
    onUpdate: ({ editor }) => {
      updateField(path, editor.getText());
      triggerAutosave();
    },
  });

  // Sync external changes (streaming, template swap) back into the editor
  useEffect(() => {
    if (editor && value !== editor.getText()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  return <EditorContent editor={editor} as={as} className={className} />;
}
```

Bullet lists use a different pattern — the array shape is the source of truth, and each bullet is its own `EditableText`. Reordering uses `dnd-kit`:

```jsx
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy }
  from "@dnd-kit/sortable";

function BulletList({ expIdx }) {
  const bullets = useResumeStore((s) => s.resume?.experience?.[expIdx]?.bullets);
  const reorder = useResumeStore((s) => s.reorderBullets);

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over.id) reorder(expIdx, active.id, over.id);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={bullets.map((_, i) => i)} strategy={verticalListSortingStrategy}>
        <ul>
          {bullets.map((b, i) => (
            <SortableBullet key={i} id={i} expIdx={expIdx} bulletIdx={i} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
```

### 6.5 UI shell

The top-level layout is a standard three-pane editor:

```
┌────────────────────────────────────────────────────────┐
│  Top bar:  [Title]  [Save status]  [Export]  [Profile] │
├──────────┬───────────────────────────────────┬─────────┤
│          │                                   │         │
│ Section  │       Resume Canvas               │ Right   │
│ nav      │       (template renders here)     │ panel   │
│          │                                   │ -theme  │
│ - Sum    │       [editable in place]         │ -tmpl   │
│ - Exp    │                                   │ -AI     │
│ - Edu    │                                   │  actions│
│ - Skill  │                                   │         │
│          │                                   │         │
└──────────┴───────────────────────────────────┴─────────┘
```

- **Left nav**: jumps to sections, shows AI suggestions per section.
- **Center**: the rendered template, fully editable.
- **Right panel**: template picker (thumbnails), theme controls (accent color, font), section-level AI actions ("rewrite this section to emphasize impact").

---

## 7. Request Lifecycles

### 7.1 First upgrade

1. User pastes text or uploads a file on the landing screen.
2. `POST /api/resumes/parse` returns clean plain text.
3. User clicks "Upgrade" (optionally with a target role).
4. Frontend opens an SSE connection to `/api/resumes/upgrade`.
5. Backend invokes Claude with the schema as a forced tool.
6. Each `input_json_delta` is wrapped in an SSE frame and pushed to the client.
7. Client accumulates the buffer, partial-parses on every frame, writes to Zustand.
8. The template, subscribed to the store, re-renders progressively: name → headline → summary → experience.
9. On `[DONE]`, status flips to `editing` and Tiptap instances become interactive.
10. The full `Resume` is persisted with `POST /api/resumes` and the URL updates to `/resumes/{id}`.

### 7.2 Section regeneration

1. User clicks "Rewrite section" on Experience.
2. UI prompts for an instruction ("emphasize leadership").
3. `POST /api/resumes/{id}/sections/experience/regenerate` with the instruction.
4. Backend sends Claude only the relevant slice + instruction, with a partial schema (just `Experience[]`).
5. Stream returns the new section.
6. Frontend partial-parses into a temporary buffer (not the main store).
7. On `[DONE]`, the user previews the diff; on accept, the section replaces in the store and persists.

### 7.3 Edit and autosave

1. User types in a bullet's `EditableText`.
2. Tiptap `onUpdate` fires → `updateField("experience.0.bullets.2.text", value)`.
3. Store mutates.
4. `useDebouncedAutosave` schedules `PUT /api/resumes/{id}` 800ms later.
5. On next keystroke within 800ms, the debounce timer resets.
6. Save completes → status `saved`, indicator updates in top bar.

### 7.4 Template switch

1. User clicks a template thumbnail.
2. `setTemplate("executive")` writes to store.
3. `ResumeCanvas` reads the new `selectedTemplate` and renders `<ExecutiveTemplate />`.
4. Data is untouched. No backend call (unless persistence of template choice is desired — then a debounced PATCH).

### 7.5 PDF export

1. User clicks "Export".
2. Frontend POSTs `{ format: "pdf" }` to `/api/resumes/{id}/export`.
3. Server-side renderer (Playwright headless Chromium pointing at `/resumes/{id}?print=1`, or `@react-pdf/renderer` with a parallel template tree) generates the PDF.
4. PDF is uploaded to object storage; signed URL returned.
5. Browser triggers download.

**Choice between Playwright and @react-pdf/renderer:**

- `@react-pdf/renderer` — write each template twice (once for screen, once for PDF). More work; pure JS; predictable.
- Playwright — one source of truth (your web template); install Chromium on the server; CSS print media queries control PDF output. Less work; heavier infra.

Recommended: start with Playwright. Move to `@react-pdf/renderer` later if PDF cost or latency matters.

---

## 8. Tech Stack

### 8.1 Backend

| Concern | Choice |
|---|---|
| Web framework | FastAPI (async, streaming responses, Pydantic-native) |
| LLM SDK | `anthropic` Python SDK |
| PDF parsing | `pypdf` (default), `pdfplumber` (high-fidelity) |
| DOCX parsing | `python-docx` |
| Database | PostgreSQL with `JSONB` |
| ORM | SQLAlchemy 2.0 async, or `asyncpg` direct |
| Migrations | Alembic |
| Background jobs | Celery or Arq for PDF rendering |
| Object storage | S3 (or compatible) for PDFs |
| PDF rendering | Playwright |

### 8.2 Frontend

| Concern | Choice |
|---|---|
| Framework | React 18+ (Next.js if you want SSR/edge) |
| State | Zustand + Immer + `subscribeWithSelector` |
| Server state cache | TanStack Query |
| Streaming JSON | `partial-json` (npm) — or Vercel AI SDK's `useObject` |
| Rich text | Tiptap (ProseMirror-based) |
| Drag and drop | `dnd-kit` |
| UI primitives | Radix UI |
| Styling | Tailwind CSS |
| Component library | shadcn/ui for chrome (buttons, dialogs) |
| Animations | Framer Motion (sparingly) |
| Forms | React Hook Form (if you add forms) |

### 8.3 Why these choices

- **FastAPI + Pydantic** — the Pydantic model is reused as the LLM schema, the DB validator, and the API contract. No duplication.
- **Zustand over Redux** — for a structured document, the resume IS one logical object. One store, fine-grained selectors, ~1KB. Redux's machinery is unjustified here.
- **Tiptap over Lexical** — more mature plugin ecosystem, simpler API for binding to external state. Lexical is fine too; pick based on team familiarity.
- **DOM over Konva/Fabric** — discussed at length above; the wrong tradeoff for a structured document.

---

## 9. Extensions and Open Questions

### 9.1 Collaboration

If multi-user editing becomes a requirement: add `Y.js` as a CRDT layer over the `Resume` JSON, with `y-websocket` or `liveblocks` as transport. Y.js has Tiptap bindings already. Single-user edits continue to use Zustand; Y.js is layered on top for sync.

### 9.2 Versioning and undo

Two layers:

- **In-session undo** — `zundo` middleware on Zustand gives unlimited undo/redo for free.
- **Persistent versions** — snapshots stored in `resume_versions` on significant events. UI shows a timeline.

### 9.3 Cost optimization

- Cache the parsed plain text (`/api/resumes/parse`) so re-upgrades don't re-parse.
- Cache the upgraded JSON keyed by `hash(raw_text + target_role + model_version)` so identical re-runs are free.
- Use `claude-haiku-4-5` for section-level rewrites (cheaper, fast); reserve Opus for the initial full upgrade.

### 9.4 Schema fit for non-engineering professions

The current schema is engineer-leaning. For broader fit:

- Add `publications`, `awards`, `languages`, `volunteer` as optional sections.
- Allow custom sections (`custom: { title: str, items: list[str] }[]`).
- Templates render only the sections present.

### 9.5 Mobile

The editor described here assumes desktop. Mobile-first editing of structured documents is hard (no hover, small targets). Mobile likely becomes "view, share, export" with editing deferred to desktop.

### 9.6 ATS optimization

ATS systems prefer simple, single-column layouts with standard section headers and plain text. Provide an "ATS-friendly" template that uses minimal styling and verbose headers ("Work Experience" not "Experience"). Detect target ATS quirks and adjust template choice automatically.

### 9.7 What about Canva-style free-form mode?

If users eventually want free-positioning of elements (logos, photos, decorative shapes), add a parallel mode:

- Use `Polotno` SDK (Konva-based, batteries included for Canva-style editors).
- Keep the structured mode as the default; free mode is opt-in.
- Free mode stores absolute positions alongside the structured data: `Resume.layout_overrides`.
- PDF export ignores overrides in structured mode; respects them in free mode.

This is deferred work — most resume users do not want free positioning. Validate the demand before building it.

---

## Appendix A: Field-by-field streaming order

To maximize perceived speed, the schema's field order is also the LLM's emission order. Users see:

1. `name` — appears within ~150ms
2. `headline` — within ~300ms
3. `contact` — within ~500ms
4. `summary` — within ~1s, streams character by character
5. `experience[0]` — within ~2s, then each subsequent experience fills in
6. `education`, `skills`, etc. — fill in last

The template handles missing fields gracefully — skeleton loaders for sections not yet streamed.

## Appendix B: Partial-JSON parsing edge cases

The `partial-json` library handles:

- Truncated strings — returns the prefix received so far.
- Incomplete arrays — returns the array with completed elements; partial element omitted unless `ALLOW_PARTIAL_OBJECT` is set.
- Trailing commas / unclosed braces — fixed during parse.
- Numbers being typed — returned as `null` until the token completes.

Edge cases to handle in your renderer:

- A bullet may briefly appear with `text` but no `impact_score`. Render gracefully.
- An experience may appear with `company` and `title` but no `bullets` array yet. Show the header, defer bullets to a skeleton.
- The whole `experience` array may briefly be `[]` before the first element streams in.

## Appendix C: Why not Konva.js for the editor

Considered and rejected. Trade-offs documented:

- **No native text editing.** Would require a transparent `<textarea>` overlay positioned over the canvas during edit mode. Janky on every browser.
- **No accessibility tree.** Canvas is opaque to screen readers. ADA / EAA exposure for a B2C product.
- **PDF export requires a parallel renderer.** Canvas rasterizes; vector PDF needs a separate SVG/PDF pipeline.
- **Layout engine missing.** Resumes need text reflow when content grows. CSS does this for free; Konva requires implementing it.
- **Smaller ecosystem.** DOM has Tiptap, dnd-kit, Radix, shadcn. Konva-world has Polotno (commercial wrapper) and not much else.

Konva is the right choice for free-form design tools. A resume editor is the wrong workload. If we eventually want free mode, layer Polotno alongside the structured mode rather than rebuild the structured editor on Konva.
