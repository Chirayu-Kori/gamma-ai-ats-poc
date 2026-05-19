"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Menu,
  Settings,
  Download,
  User,
  ArrowLeft,
  AlertTriangle,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RightSidebar } from "./right-sidebar";
import { UploadCanvas } from "./upload-canvas";
import { GenerateStreamCanvas } from "./generate-stream-canvas";
import { ResumeCanvas } from "@/components/ResumeCanvas";
import { useResumeStore } from "@/stores/resumeStore";
import { useUploadStore } from "@/stores/uploadStore";
import { useGenerateStore } from "@/stores/generateStore";
import { normalizePageFormatId } from "@/lib/page-size";
import { apiClient } from "@/lib/api-client";
import { resumeQueryKeys } from "@/lib/query-keys";
import type { ResumeRecord } from "@/lib/types/resume-meta";
import { cn } from "@/lib/utils";
import { useResumePersistence } from "@/hooks/useResumePersistence";

type EditorPhase = "upload" | "generate" | "resume";

type EditorLayoutProps = {
  resumeId?: string;
};

import { DocumentOutline } from "./document-outline";
import { ResizableSidebar } from "./resizable-sidebar";

const LEFT_SIDEBAR_DEFAULT = 200;
const LEFT_SIDEBAR_MIN = 160;
const LEFT_SIDEBAR_MAX = 360;
const RIGHT_SIDEBAR_DEFAULT = 300;
const RIGHT_SIDEBAR_MIN = 220;
const RIGHT_SIDEBAR_MAX = 480;

export function EditorLayout({ resumeId }: EditorLayoutProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setResume = useResumeStore((s) => s.setResume);
  const setStatus = useResumeStore((s) => s.setStatus);
  const setTheme = useResumeStore((s) => s.setTheme);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const setPageSize = useResumeStore((s) => s.setPageSize);
  const setLastSavedAt = useResumeStore((s) => s.setLastSavedAt);
  const clearUnsaved = useResumeStore((s) => s.clearUnsaved);
  const resetUpload = useUploadStore((s) => s.reset);
  const parsedResumeId = useUploadStore((s) => s.parsedResumeId);

  const [phase, setPhase] = useState<EditorPhase>(
    resumeId ? "resume" : "upload",
  );
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState(LEFT_SIDEBAR_DEFAULT);
  const [rightWidth, setRightWidth] = useState(RIGHT_SIDEBAR_DEFAULT);
  const [persistError, setPersistError] = useState<string | null>(null);

  const handleLeftWidthChange = useCallback((width: number) => {
    setLeftWidth(width);
  }, []);

  const handleRightWidthChange = useCallback((width: number) => {
    setRightWidth(width);
  }, []);

  const {
    data: record,
    isError,
    error,
  } = useQuery({
    queryKey: resumeQueryKeys.detail(resumeId ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get<ResumeRecord>(
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

  // Sync the record into the store, but DON'T clobber a fresh in-memory
  // resume the user just streamed. The store wins over the record if it
  // has more content than what's persisted (the PUT may have raced).
  useEffect(() => {
    if (!resumeId) {
      setResume(null);
      setStatus("idle");
      setPhase("upload");
      resetUpload();
      return;
    }
    if (!record) return;

    const inStore = useResumeStore.getState().resume;
    const storeBetter =
      inStore &&
      (inStore.experience?.length ?? 0) >
        (record.resume.experience?.length ?? 0);
    if (!storeBetter) {
      setResume(record.resume);
    }
    if (record.theme && Object.keys(record.theme).length > 0) {
      setTheme(record.theme);
    }
    if (record.template_id) {
      setTemplate(record.template_id);
    }
    if (record.theme) {
      const t = record.theme;
      useGenerateStore.getState().setPageSize({
        format: normalizePageFormatId(t.pageFormat),
        width: Number(t.pageWidth),
        height: Number(t.pageHeight),
        unit: t.pageUnit === "in" ? "in" : "mm",
      });
    }
    setStatus("editing");
    if (record.updated_at) {
      setLastSavedAt(record.updated_at);
      clearUnsaved();
    }
    setPhase("resume");
  }, [
    resumeId,
    record,
    setResume,
    setStatus,
    setTheme,
    setTemplate,
    setPageSize,
    setLastSavedAt,
    clearUnsaved,
    resetUpload,
  ]);

  const handleParsed = (_parsedId: string) => {
    setPhase("generate");
  };

  const handleGenerateComplete = async () => {
    setPersistError(null);
    const gen = useGenerateStore.getState();
    setPageSize({
      format: gen.format,
      width: Number(gen.pageWidth),
      height: Number(gen.pageHeight),
      unit: gen.pageUnit,
    });
    const parsedId = useUploadStore.getState().parsedResumeId ?? resumeId;
    const currentResume = useResumeStore.getState().resume;
    const currentTheme = useResumeStore.getState().theme;
    const currentTemplate = useResumeStore.getState().selectedTemplate;
    if (parsedId && currentResume) {
      try {
        const { data: saved } = await apiClient.put<ResumeRecord>(
          `/api/resumes/${parsedId}`,
          {
            resume: currentResume,
            theme: currentTheme,
            template_id: currentTemplate,
          },
        );
        if (saved.updated_at) {
          setLastSavedAt(saved.updated_at);
          clearUnsaved();
        }
        await queryClient.invalidateQueries({
          queryKey: resumeQueryKeys.detail(parsedId),
        });
        await queryClient.invalidateQueries({
          queryKey: [...resumeQueryKeys.detail(parsedId), "changes"],
        });
      } catch (err) {
        console.error("Failed to persist generated resume", err);
        setPersistError(extractErrorMessage(err));
      }
    }
    setPhase("resume");
    if (!resumeId && parsedId) {
      router.replace(`/resumes/${parsedId}`);
    }
  };

  const activeResumeId = resumeId ?? parsedResumeId ?? undefined;
  const { saveNow } = useResumePersistence();
  const saveStatus = useResumeStore((s) => s.status);

  const displayLabel = record?.label ?? resumeId;

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
        <PhaseBadge phase={phase} />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden font-medium sm:flex"
          onClick={() => void saveNow()}
          disabled={phase !== "resume" || saveStatus === "saving" || !activeResumeId}
        >
          <Save className="mr-2 h-4 w-4" />
          {saveStatus === "saving" ? "Saving…" : "Save"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-muted hidden font-medium transition-all sm:flex"
          onClick={() => window.print()}
          disabled={phase !== "resume"}
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
          <SheetContent side="right" className="w-[320px] p-0 sm:max-w-sm">
            <RightSidebar phase={phase} resumeId={activeResumeId} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );

  const LeftPanelContent = () => (
    <div className="bg-background flex h-full min-h-0 flex-col">
      <div className="border-b px-3 py-2.5">
        <h2 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
          Outline
        </h2>
      </div>
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {phase === "upload" ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400 italic">
            Upload a resume to begin.
          </div>
        ) : (
          <DocumentOutline />
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-background text-foreground flex h-screen w-full flex-col overflow-hidden font-sans">
      <TopBar />
      {persistError && (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          <AlertTriangle className="size-4 shrink-0" />
          <span className="truncate">
            Couldn&apos;t save the upgraded resume to the backend:{" "}
            <span className="font-semibold">{persistError}</span>. Your
            in-browser copy is still here — try editing a field to autosave.
          </span>
        </div>
      )}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ResizableSidebar
          side="left"
          width={leftWidth}
          minWidth={LEFT_SIDEBAR_MIN}
          maxWidth={LEFT_SIDEBAR_MAX}
          collapsed={isLeftCollapsed}
          onWidthChange={handleLeftWidthChange}
          className="hidden md:flex"
        >
          <LeftPanelContent />
        </ResizableSidebar>

        <main className="custom-scrollbar min-h-0 flex-1 overflow-y-auto bg-linear-to-b from-sky-50/80 via-slate-100/50 to-slate-100/50 p-4 sm:p-6 lg:p-8">
          {phase === "upload" && <UploadCanvas onParsed={handleParsed} />}
          {phase === "generate" && (
            <GenerateStreamCanvas
              resumeId={resumeId}
              onComplete={handleGenerateComplete}
            />
          )}
          {phase === "resume" && <ResumeCanvas />}
        </main>

        <ResizableSidebar
          side="right"
          width={rightWidth}
          minWidth={RIGHT_SIDEBAR_MIN}
          maxWidth={RIGHT_SIDEBAR_MAX}
          collapsed={isRightCollapsed}
          onWidthChange={handleRightWidthChange}
          className="hidden lg:flex"
        >
          <RightSidebar phase={phase} resumeId={activeResumeId} />
        </ResizableSidebar>
      </div>
    </div>
  );
}

function PhaseBadge({ phase }: { phase: EditorPhase }) {
  const cfg: Record<EditorPhase, { label: string; className: string }> = {
    upload: { label: "Upload", className: "bg-amber-100 text-amber-700" },
    generate: { label: "Streaming", className: "bg-blue-100 text-blue-700" },
    resume: { label: "Editing", className: "bg-green-100 text-green-700" },
  };
  const c = cfg[phase];
  return (
    <span
      className={cn(
        "ml-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
        c.className,
      )}
    >
      {c.label}
    </span>
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

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const resp = (err as { response?: { data?: unknown; status?: number } })
      .response;
    if (resp?.data) {
      if (typeof resp.data === "string") return resp.data;
      if (typeof resp.data === "object" && resp.data !== null) {
        const d = resp.data as { detail?: unknown; message?: string };
        if (typeof d.detail === "string") return d.detail;
        if (typeof d.message === "string") return d.message;
        try {
          return JSON.stringify(d).slice(0, 200);
        } catch {
          /* fall through */
        }
      }
    }
    if (resp?.status) return `HTTP ${resp.status}`;
  }
  if (err instanceof Error) return err.message;
  return "Unknown error";
}
