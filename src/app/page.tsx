"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Clock, ExternalLink, Trash2 } from "lucide-react";

import { apiClient } from "@/lib/api-client";
import type { ResumeMeta } from "@/lib/types/resume-meta";

function formatUpdated(iso?: string) {
  if (!iso) return "Updated recently";
  try {
    const d = new Date(iso);
    return `Updated ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return "Updated recently";
  }
}

export default function Home() {
  const [resumes, setResumes] = useState<ResumeMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchResumes() {
    try {
      const { data } = await apiClient.get<ResumeMeta[]>("/api/resumes");
      setResumes(data);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch resumes", e);
      setError(
        "Could not reach the API. Is the FastAPI backend running on " +
          (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") +
          "?",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchResumes();
  }, []);

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this resume?")) return;
    try {
      await apiClient.delete(`/api/resumes/${id}`);
      setResumes((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      <main className="mx-auto max-w-7xl px-6 py-16">
        <header className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text pb-2 text-4xl font-extrabold tracking-tight text-transparent md:text-5xl">
              Your Workspace
            </h1>
            <p className="mt-2 text-lg font-medium text-slate-500">
              Manage and upgrade your ATS-friendly resumes
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Link
              href="/editor"
              className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-8 transition-all duration-300 hover:border-blue-500/50 hover:bg-white"
            >
              <div className="rounded-full bg-blue-50 p-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100">
                <Plus className="h-8 w-8 text-blue-400" />
              </div>
              <span className="mt-4 font-semibold text-slate-600 transition-colors group-hover:text-blue-600">
                Create New Resume
              </span>
            </Link>

            {resumes.map((resume) => (
              <Link
                key={resume.id}
                href={`/resumes/${resume.id}`}
                className="group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-blue-50 blur-2xl transition-colors duration-500 group-hover:bg-blue-100" />
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-xl bg-slate-100/80 p-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDelete(resume.id, e)}
                        className="rounded-md p-1 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Delete resume"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <ExternalLink className="h-5 w-5 text-slate-400 opacity-0 transition-colors group-hover:text-blue-600 group-hover:opacity-100" />
                    </div>
                  </div>
                  <h3 className="line-clamp-2 text-xl leading-tight font-semibold text-slate-800 transition-colors group-hover:text-blue-600">
                    {resume.label}
                  </h3>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>{formatUpdated(resume.updated_at)}</span>
                </div>

                <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
