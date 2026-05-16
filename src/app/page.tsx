"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Clock, ExternalLink } from "lucide-react";
import { ResumeMeta } from "@/lib/types/resume-meta";

export default function Home() {
  const [resumes, setResumes] = useState<ResumeMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await fetch("/api/resumes");
        if (res.ok) {
          const data = await res.json();
          setResumes(data);
        }
      } catch (error) {
        console.error("Failed to fetch resumes", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResumes();
  }, []);

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
            {/* Create New Card */}
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

            {/* Resume Cards */}
            {resumes.map((resume) => (
              <Link
                key={resume.id}
                href={`/editor?id=${resume.id}`}
                className="group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10"
              >
                {/* Decorative background glow */}
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-blue-50 blur-2xl transition-colors duration-500 group-hover:bg-blue-100" />

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-xl bg-slate-100/80 p-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <ExternalLink className="h-5 w-5 text-slate-400 opacity-0 transition-colors group-hover:text-blue-600 group-hover:opacity-100" />
                  </div>
                  <h3 className="line-clamp-2 text-xl leading-tight font-semibold text-slate-800 transition-colors group-hover:text-blue-600">
                    {resume.label}
                  </h3>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>Updated recently</span>
                </div>

                {/* Bottom line accent overlay */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
