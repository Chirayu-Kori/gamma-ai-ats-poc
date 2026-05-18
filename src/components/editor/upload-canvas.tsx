"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X, Loader2, FileSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useParseResume } from "@/hooks/useParseResume";
import { useUploadStore, type UploadMode } from "@/stores/uploadStore";

const ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*";
const ACCEPT_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

type UploadCanvasProps = {
  onParsed: (resumeId: string) => void;
};

export function UploadCanvas({ onParsed }: UploadCanvasProps) {
  const {
    mode,
    file,
    jdText,
    status,
    error,
    setMode,
    setFile,
    setJdText,
    setStatus,
    setError,
    setParsed,
  } = useUploadStore();

  const parseMutation = useParseResume();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      if (!ACCEPT_MIME.has(f.type)) {
        setError("Unsupported file. Please upload a PDF or image.");
        return;
      }
      setError(null);
      setFile(f);
    },
    [setFile, setError],
  );

  const onSubmit = async () => {
    if (!file) {
      setError("Please choose a resume file.");
      return;
    }
    if (mode === "resume-jd" && !jdText.trim()) {
      setError("Add the job description text, or switch to Resume only.");
      return;
    }
    setStatus("parsing");
    try {
      const res = await parseMutation.mutateAsync({
        file,
        jdText: mode === "resume-jd" ? jdText : undefined,
      });
      setParsed(res.resume, res.id);
      onParsed(res.id);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Parse failed";
      setError(msg);
    }
  };

  const isParsing = status === "parsing" || parseMutation.isPending;

  return (
    <div className="mx-auto w-full max-w-3xl py-2">
      <h1 className="text-center text-2xl font-bold tracking-tight text-[#1e3a5f] sm:text-3xl">
        Start with your resume
      </h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        Upload a PDF or image. Optionally add a job description to tailor toward
        a target role.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ModeCard
          label="Resume only"
          description="Parse my resume as-is."
          active={mode === "resume-only"}
          onClick={() => setMode("resume-only")}
        />
        <ModeCard
          label="Resume + Job description"
          description="Tailor toward a target role."
          active={mode === "resume-jd"}
          onClick={() => setMode("resume-jd")}
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "mt-6 cursor-pointer rounded-2xl border-2 border-dashed bg-white p-8 text-center transition-all",
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-slate-200 hover:border-blue-300",
        )}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {file ? (
          <div className="flex items-center justify-center gap-3 text-sm">
            <FileText className="size-5 text-blue-600" />
            <span className="font-medium text-slate-700">{file.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="text-slate-400 hover:text-rose-500"
              aria-label="Remove file"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Upload className="size-6 text-blue-500" />
            <p className="text-sm font-medium">
              Drop your resume here, or click to browse
            </p>
            <p className="text-xs text-slate-400">
              PDF, PNG, JPG, WebP — max 8 MB
            </p>
          </div>
        )}
      </div>

      {mode === "resume-jd" && (
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <label className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <FileSearch className="size-3.5" />
            Job description
          </label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            rows={6}
            placeholder="Paste the job description here..."
            className="mt-2 w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          className="rounded-full bg-[#1e3a5f] px-8 hover:bg-[#162d4a] disabled:opacity-50"
          onClick={onSubmit}
          disabled={!file || isParsing}
        >
          {isParsing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Parsing with Gemini…
            </span>
          ) : (
            "Parse resume"
          )}
        </Button>
      </div>
    </div>
  );
}

function ModeCard({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start rounded-2xl border bg-white p-4 text-left transition-all",
        active
          ? "border-blue-500 ring-2 ring-blue-100"
          : "border-slate-200 hover:border-blue-200",
      )}
    >
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="mt-1 text-xs text-slate-500">{description}</span>
    </button>
  );
}
