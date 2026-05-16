"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, Settings, Download, User, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DesignPanel } from "./design-panel";
import { GenerateCanvas } from "./generate-canvas";
import { ResumeCanvas } from "@/components/ResumeCanvas";
import { useResumeStore } from "@/stores/resumeStore";
import { useGenerateStore } from "@/stores/generateStore";
import { DEFAULT_RESUME } from "@/lib/default-resume";
import { outlineBlocksToResume } from "@/lib/outline-to-resume";
import { apiClient } from "@/lib/api-client";
import { resumeQueryKeys } from "@/lib/query-keys";
import type { ResumeMeta } from "@/lib/types/resume-meta";
import { cn } from "@/lib/utils";
import type { EditableOutlineBlock } from "@/lib/outline-utils";

type EditorPhase = "generate" | "resume";

type EditorLayoutProps = {
  resumeId?: string;
};

export function EditorLayout({ resumeId }: EditorLayoutProps) {
  const router = useRouter();
  const setResume = useResumeStore((s) => s.setResume);
  const setStatus = useResumeStore((s) => s.setStatus);
  const [phase, setPhase] = useState<EditorPhase>(
    resumeId ? "resume" : "generate",
  );
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  const {
    data: resumeMeta,
    isError,
    error,
  } = useQuery({
    queryKey: resumeQueryKeys.detail(resumeId ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get<ResumeMeta>(
        `/api/resumes/${resumeId}`,
      );
      return data;
    },
    enabled: Boolean(resumeId),
    retry: false,
  });

  useEffect(() => {
    if (resumeId && isError && axiosIs404(error)) {
      notFound();
    }
  }, [resumeId, isError, error]);

  useEffect(() => {
    if (resumeId) {
      if (!useResumeStore.getState().resume) {
        setResume(DEFAULT_RESUME);
      }
      setStatus("editing");
      setPhase("resume");
    } else {
      setResume(null);
      setStatus("idle");
      setPhase("generate");
    }
  }, [resumeId, setResume, setStatus]);

  const handleContinueToResume = () => {
    const outlineBlocks = useGenerateStore.getState().blocks;
    const resumeFromOutline =
      outlineBlocks.length > 0
        ? outlineBlocksToResume(outlineBlocks)
        : DEFAULT_RESUME;

    setResume(resumeFromOutline);
    setStatus("editing");

    if (resumeId) {
      setPhase("resume");
    } else {
      const newId = crypto.randomUUID();
      router.push(`/resumes/${newId}`);
    }
  };

  const displayLabel = resumeMeta?.label ?? resumeId;

  const TopBar = () => (
    <header className="bg-background relative z-10 flex h-14 shrink-0 items-center justify-between border-b px-4 shadow-sm transition-all">
      <div className="flex items-center gap-2">
        <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0 sm:max-w-sm">
            <LeftPanelContent />
          </SheetContent>
        </Sheet>
        <Button
          variant="ghost"
          size="icon"
          className="ml-1 hidden md:flex"
          onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="text-muted-foreground h-4 w-4" />
          <span className="text-lg font-semibold tracking-tight md:text-xl">
            Resume Upgrader
          </span>
          {displayLabel && phase === "resume" && (
            <span className="text-muted-foreground hidden text-sm font-normal sm:inline">
              / {displayLabel}
            </span>
          )}
        </Link>
        <span
          className={`ml-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
            phase === "generate"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {phase === "generate" ? "Draft" : "Saved"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-muted hidden font-medium transition-all sm:flex"
        >
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
        <Button variant="ghost" size="icon" className="ml-2 hidden sm:flex">
          <User className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="ml-1 hidden lg:flex"
          onClick={() => setIsRightCollapsed(!isRightCollapsed)}
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Sheet open={rightOpen} onOpenChange={setRightOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-1 lg:hidden">
              <Settings className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0 sm:max-w-sm">
            <DesignPanel phase={phase} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );

  const { blocks, selectedBlockId, setSelectedBlockId } = useGenerateStore();

  const scrollToSection = (id: string) => {
    setSelectedBlockId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const LeftPanelContent = () => (
    <div className="bg-background flex h-full min-h-0 flex-col">
      <div className="border-b p-5">
        <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          Document Outline
        </h2>
      </div>
      <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-3">
        {phase === "generate" ? (
          blocks.length > 0 ? (
            blocks.map((block: EditableOutlineBlock) => (
              <Button
                key={block.sortId}
                variant={
                  selectedBlockId === block.sortId ? "secondary" : "ghost"
                }
                className={cn(
                  "w-full justify-start text-sm font-medium transition-all",
                  selectedBlockId === block.sortId &&
                    "bg-blue-50 text-blue-700 hover:bg-blue-100",
                )}
                onClick={() => scrollToSection(block.sortId)}
              >
                <div className="mr-3 flex size-5 shrink-0 items-center justify-center rounded-md bg-blue-100 text-[10px] font-bold text-blue-700">
                  {block.id}
                </div>
                <span className="truncate">
                  {block.title || "Untitled Section"}
                </span>
              </Button>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm text-slate-400 italic">
              No sections generated yet...
            </div>
          )
        ) : (
          [
            "Personal Info",
            "Summary",
            "Experience",
            "Education",
            "Skills",
            "Projects",
          ].map((section) => (
            <Button
              key={section}
              variant="ghost"
              className="w-full justify-start text-sm font-medium"
            >
              {section}
            </Button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-background text-foreground flex h-screen w-full flex-col overflow-hidden font-sans">
      <TopBar />
      <div className="flex flex-1 overflow-hidden lg:gap-0">
        <div
          className={`bg-background/50 z-0 hidden h-full shrink-0 overflow-hidden border-r backdrop-blur-sm transition-all duration-300 ease-in-out md:block ${isLeftCollapsed ? "w-0 border-transparent opacity-0" : "w-64 opacity-100"}`}
        >
          <div className="h-full w-64">
            <LeftPanelContent />
          </div>
        </div>

        <main className="custom-scrollbar flex-1 overflow-y-auto bg-linear-to-b from-sky-50/80 via-slate-100/50 to-slate-100/50 p-4 sm:p-6 lg:p-8">
          {phase === "generate" ? (
            <GenerateCanvas onComplete={handleContinueToResume} />
          ) : (
            <ResumeCanvas />
          )}
        </main>

        <div
          className={`bg-background/50 z-0 hidden h-full shrink-0 overflow-hidden border-l backdrop-blur-sm transition-all duration-300 ease-in-out lg:block ${isRightCollapsed ? "w-0 border-transparent opacity-0" : "w-72 opacity-100"}`}
        >
          <div className="h-full w-72">
            <DesignPanel phase={phase} />
          </div>
        </div>
      </div>
    </div>
  );
}

function axiosIs404(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  );
}
