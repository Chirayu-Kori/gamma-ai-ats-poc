"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Clock, ExternalLink, Trash2, AlertTriangle } from "lucide-react";

import { apiClient } from "@/lib/api-client";
import type { ResumeMeta } from "@/lib/types/resume-meta";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  async function confirmDelete() {
    if (!resumeToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/resumes/${resumeToDelete}`);
      setResumes((r) => r.filter((x) => x.id !== resumeToDelete));
      setResumeToDelete(null);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setResumeToDelete(id);
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
          <Skeleton className="h-96 w-full rounded-3xl border border-slate-200/60 bg-gray-200/50 backdrop-blur-sm" />
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
              <div
                key={resume.id}
                className="group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <Link
                  href={`/resumes/${resume.id}`}
                  className="absolute inset-0 z-0"
                  aria-label={`Open ${resume.label}`}
                />
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-blue-50 blur-2xl transition-colors duration-500 group-hover:bg-blue-100 pointer-events-none" />
                <div className="relative z-10 flex h-full flex-col justify-between p-6 pointer-events-none">
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="rounded-xl bg-slate-100/80 p-3">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex items-center gap-1 pointer-events-auto">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => handleDelete(resume.id, e)}
                          className="relative z-20 h-8 w-8 cursor-pointer rounded-lg text-slate-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete resume"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          asChild
                          className="relative z-20 h-8 w-8 cursor-pointer rounded-lg text-slate-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Link href={`/resumes/${resume.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
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
                </div>

                <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-500 group-hover:w-full" />
              </div>
            ))}
          </div>
        )}
      </main>

      <AlertDialog
        open={!!resumeToDelete}
        onOpenChange={(open) => !open && !isDeleting && setResumeToDelete(null)}
      >
        <AlertDialogContent className="border-slate-200/20 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-50 text-rose-500 ring-4 ring-rose-50/50">
              <AlertTriangle className="animate-in fade-in zoom-in duration-300" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-500">
              This action will permanently delete your resume and all associated
              data. This cannot be undone. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-2xl border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              variant="destructive"
              className="rounded-2xl bg-rose-600 font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-700 hover:shadow-rose-300 active:scale-95 disabled:opacity-70"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
