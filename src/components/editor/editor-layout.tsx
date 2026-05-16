"use client";

import { useState, useEffect, Suspense } from "react";
import { Menu, Settings, Download, User, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { GenerateCanvas } from "./generate-canvas";
import { ResumeCanvas } from "@/components/ResumeCanvas";
import { useResumeStore } from "@/stores/resumeStore";
import { DEFAULT_RESUME } from "@/lib/default-resume";

type EditorPhase = "generate" | "resume";

export function EditorLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const setResume = useResumeStore((s) => s.setResume);
  const setStatus = useResumeStore((s) => s.setStatus);
  const [phase, setPhase] = useState<EditorPhase>(id ? "resume" : "generate");
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  useEffect(() => {
    if (id) {
      // If we have an ID, we assume we are editing an existing resume
      // For now, we'll just ensure SOME data is there so the canvas renders.
      if (!useResumeStore.getState().resume) {
        setResume(DEFAULT_RESUME);
      }
      setStatus("editing");
      setPhase("resume");
    } else {
      // If no ID, we are starting fresh
      setResume(null);
      setStatus("idle");
      setPhase("generate");
    }
  }, [id, setResume, setStatus]);

  const handleContinueToResume = () => {
    if (!useResumeStore.getState().resume) {
      setResume(DEFAULT_RESUME);
    }
    setStatus("editing");
    setPhase("resume");
  };

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
            Focus Resume
          </span>
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
            <RightPanelContent />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );

  const LeftPanelContent = () => (
    <div className="bg-background flex h-full min-h-0 flex-col">
      <div className="border-b p-5">
        <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          Document Outline
        </h2>
      </div>
      <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-3">
        {[
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
        ))}
      </div>
    </div>
  );

  const RightPanelContent = () => (
    <div className="bg-background flex h-full min-h-0 flex-col">
      <div className="border-b p-5">
        <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          Design Details
        </h2>
      </div>
      <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-5">
        <div>
          <h3 className="mb-3 flex items-center justify-between text-sm font-semibold">
            Templates
            <span className="text-muted-foreground cursor-pointer text-xs font-normal hover:underline">
              View all
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 border-primary group relative flex aspect-[1/1.414] cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 shadow-sm transition-all">
              <div className="bg-background flex h-20 w-16 flex-col gap-1 rounded-sm border border-black/5 p-2 shadow-sm">
                <div className="bg-primary/20 h-1 w-full rounded-full" />
                <div className="bg-primary/20 h-1 w-2/3 rounded-full" />
                <div className="bg-muted mt-2 h-1 w-full rounded-full" />
                <div className="bg-muted h-1 w-full rounded-full" />
              </div>
            </div>
            <div className="bg-muted/30 hover:border-primary/50 flex aspect-[1/1.414] cursor-pointer items-center justify-center rounded-lg border transition-all hover:shadow-sm">
              <div className="bg-background flex h-20 w-16 flex-col gap-1.5 rounded-sm border border-black/5 p-2 shadow-sm">
                <div className="bg-primary/20 mx-auto h-1.5 w-1/2 rounded-full" />
                <div className="bg-muted mt-1.5 h-1 w-full rounded-full" />
                <div className="bg-muted h-1 w-full rounded-full" />
                <div className="bg-muted h-1 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="mb-4 text-sm font-semibold">Color Palette</h3>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              className="ring-primary ring-offset-background h-8 w-8 rounded-full bg-blue-600 shadow-sm ring-2 ring-offset-2 transition-all"
            />
            <button
              type="button"
              className="h-8 w-8 rounded-full border bg-slate-900 shadow-sm transition-all hover:scale-105"
            />
            <button
              type="button"
              className="h-8 w-8 rounded-full border bg-emerald-600 shadow-sm transition-all hover:scale-105"
            />
            <button
              type="button"
              className="h-8 w-8 rounded-full border bg-violet-600 shadow-sm transition-all hover:scale-105"
            />
            <button
              type="button"
              className="h-8 w-8 rounded-full border bg-rose-600 shadow-sm transition-all hover:scale-105"
            />
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="mb-4 text-sm font-semibold">Typography</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="h-10 w-full justify-between font-serif"
            >
              Merriweather
              <span className="text-muted-foreground text-xs tracking-widest uppercase">
                aa
              </span>
            </Button>
            <Button
              variant="outline"
              className="border-primary bg-primary/5 h-10 w-full justify-between font-sans"
            >
              Inter
              <span className="text-muted-foreground text-xs tracking-widest uppercase">
                aa
              </span>
            </Button>
          </div>
        </div>
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
            <RightPanelContent />
          </div>
        </div>
      </div>
    </div>
  );
}
