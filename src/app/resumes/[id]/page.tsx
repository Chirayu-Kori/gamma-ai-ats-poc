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

export default function ResumeEditorPage({ params }: { params: { id: string } }) {
  const status = useResumeStore((s) => s.status);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate);
  const { start, isUpgradePending } = useResumeStream();

  const { data: resumeMeta } = useQuery({
    queryKey: resumeQueryKeys.detail(params.id),
    queryFn: async () => {
      const { data } = await apiClient.get<ResumeMeta>(`/api/resumes/${params.id}`);
      return data;
    },
  });

  const handleMockStream = () => {
    // This connects to the endpoint `/api/resumes/upgrade` from the hook
    // Usually you'd trigger this on file upload, but for now we put a raw string
    start({
      rawText: "John Doe\njohn@example.com\nSoftware Engineer with 5 years experience.",
      targetRole: "Senior Frontend Engineer"
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-card">
        <div className="font-semibold tracking-tight text-lg flex items-center gap-2">
          <span>Resume Upgrader</span>
          <span className="text-muted-foreground font-normal text-sm">
            / {resumeMeta?.label ?? params.id}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground flex items-center gap-2 capitalize mr-4">
            {status === "saving" && <><Loader2 className="h-3 w-3 animate-spin"/> Saving...</>}
            {status === "editing" && <><Save className="h-3 w-3"/> Saved</>}
            {status === "streaming" && <><span className="relative flex h-2 w-2 shadow-sm shadow-emerald-400"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span> Streaming</>}
          </div>
          <button 
            className="text-sm border rounded-md px-3 py-1.5 hover:bg-accent flex items-center gap-2 transition"
            onClick={handleMockStream}
            disabled={isUpgradePending}
          >
            <RefreshCw className={`h-4 w-4 ${isUpgradePending ? "animate-spin" : ""}`} />
            Mock Upgrade
          </button>
          <button className="text-sm bg-primary text-primary-foreground rounded-md px-3 py-1.5 hover:brightness-110 flex items-center gap-2 transition shadow-sm">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Nav Pane */}
        <aside className="w-64 border-r bg-card/50 hidden lg:flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Sections</h3>
          </div>
          <nav className="flex-1 overflow-auto p-2 space-y-1">
            {["Contact", "Summary", "Experience", "Education", "Skills"].map(section => (
              <a 
                key={section} 
                href={`#${section.toLowerCase()}`}
                className="block px-3 py-2 text-sm rounded-md hover:bg-accent transition cursor-pointer"
              >
                {section}
              </a>
            ))}
          </nav>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 relative overflow-auto">
          <ResumeCanvas />
        </main>

        {/* Right Panel - Settings */}
        <aside className="w-72 border-l bg-card/50 hidden xl:flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Design</h3>
          </div>
          <div className="p-4 space-y-4 overflow-auto">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Templates</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(TEMPLATES).map((tid) => (
                  <button
                    key={tid}
                    onClick={() => setTemplate(tid)}
                    className={`border rounded-lg p-2 text-left hover:border-primary transition aspect-3/4 flex flex-col ${selectedTemplate === tid ? "ring-2 ring-primary border-primary bg-primary/5" : ""}`}
                  >
                    <div className="bg-muted w-full flex-1 rounded-sm mb-2 shadow-inner"></div>
                    <span className="text-xs font-medium truncate w-full text-center">{TEMPLATES[tid].name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <label className="text-sm font-medium">Theme Options</label>
              <p className="text-xs text-muted-foreground">Select typography and color accents in this panel.</p>
              {/* Color swatches would go here */}
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}
