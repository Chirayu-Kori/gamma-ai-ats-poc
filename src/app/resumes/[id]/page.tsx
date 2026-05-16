"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Download, Save, RefreshCw } from "lucide-react";
import React from "react";

import { ResumeCanvas } from "../../../components/ResumeCanvas";
import { TEMPLATES } from "../../../components/templates/registry";
import { useResumeStream } from "../../../hooks/useResumeStream";
import { apiClient } from "@/lib/api-client";
import { resumeQueryKeys } from "@/lib/query-keys";
import type { ResumeMeta } from "@/lib/types/resume-meta";
import { useResumeStore } from "../../../stores/resumeStore";

export default function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const status = useResumeStore((s) => s.status);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate);
  const { start, isUpgradePending } = useResumeStream();

  const { data: resumeMeta } = useQuery({
    queryKey: resumeQueryKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ResumeMeta>(`/api/resumes/${id}`);
      return data;
    },
  });

  const handleMockStream = () => {
    // This connects to the endpoint `/api/resumes/upgrade` from the hook
    // Usually you'd trigger this on file upload, but for now we put a raw string
    start({
      rawText:
        "John Doe\njohn@example.com\nSoftware Engineer with 5 years experience.",
      targetRole: "Senior Frontend Engineer",
    });
  };

  return (
    <div className="bg-background text-foreground flex h-screen w-full flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="bg-card flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span>Resume Upgrader</span>
          <span className="text-muted-foreground text-sm font-normal">
            / {resumeMeta?.label ?? id}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-muted-foreground mr-4 flex items-center gap-2 text-sm capitalize">
            {status === "saving" && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> Saving...
              </>
            )}
            {status === "editing" && (
              <>
                <Save className="h-3 w-3" /> Saved
              </>
            )}
            {status === "streaming" && (
              <>
                <span className="relative flex h-2 w-2 shadow-sm shadow-emerald-400">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>{" "}
                Streaming
              </>
            )}
          </div>
          <button
            className="hover:bg-accent flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition"
            onClick={handleMockStream}
            disabled={isUpgradePending}
          >
            <RefreshCw
              className={`h-4 w-4 ${isUpgradePending ? "animate-spin" : ""}`}
            />
            Mock Upgrade
          </button>
          <button className="bg-primary text-primary-foreground flex items-center gap-2 rounded-md px-3 py-1.5 text-sm shadow-sm transition hover:brightness-110">
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Nav Pane */}
        <aside className="bg-card/50 hidden w-64 flex-col border-r lg:flex">
          <div className="border-b p-4">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
              Sections
            </h3>
          </div>
          <nav className="flex-1 space-y-1 overflow-auto p-2">
            {["Contact", "Summary", "Experience", "Education", "Skills"].map(
              (section) => (
                <a
                  key={section}
                  href={`#${section.toLowerCase()}`}
                  className="hover:bg-accent block cursor-pointer rounded-md px-3 py-2 text-sm transition"
                >
                  {section}
                </a>
              ),
            )}
          </nav>
        </aside>

        {/* Center Canvas */}
        <main className="relative flex-1 overflow-auto">
          <ResumeCanvas />
        </main>

        {/* Right Panel - Settings */}
        <aside className="bg-card/50 hidden w-72 flex-col border-l xl:flex">
          <div className="border-b p-4">
            <h3 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
              Design
            </h3>
          </div>
          <div className="space-y-4 overflow-auto p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Templates</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(TEMPLATES).map((tid) => (
                  <button
                    key={tid}
                    onClick={() => setTemplate(tid)}
                    className={`hover:border-primary flex aspect-3/4 flex-col rounded-lg border p-2 text-left transition ${selectedTemplate === tid ? "ring-primary border-primary bg-primary/5 ring-2" : ""}`}
                  >
                    <div className="bg-muted mb-2 w-full flex-1 rounded-sm shadow-inner"></div>
                    <span className="w-full truncate text-center text-xs font-medium">
                      {TEMPLATES[tid].name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <label className="text-sm font-medium">Theme Options</label>
              <p className="text-muted-foreground text-xs">
                Select typography and color accents in this panel.
              </p>
              {/* Color swatches would go here */}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
