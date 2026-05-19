"use client";

import { useState } from "react";
import { MessageSquare, Sparkles, SlidersHorizontal } from "lucide-react";

import { AiAssistantPanel } from "./ai-assistant-panel";
import { ChangesPanel } from "./changes-panel";
import { DesignPanel } from "./design-panel";
import { cn } from "@/lib/utils";

type RightSidebarProps = {
  phase: "upload" | "generate" | "resume";
  resumeId?: string;
};

type Tab = "assistant" | "changes" | "design";

export function RightSidebar({ phase, resumeId }: RightSidebarProps) {
  const [tab, setTab] = useState<Tab>(
    phase === "upload" ? "design" : "assistant",
  );

  return (
    <div className="bg-background flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-1 border-b p-2">
        <TabButton
          active={tab === "assistant"}
          onClick={() => setTab("assistant")}
          icon={<MessageSquare className="size-3.5" />}
          label="AI"
        />
        <TabButton
          active={tab === "changes"}
          onClick={() => setTab("changes")}
          icon={<Sparkles className="size-3.5" />}
          label="Changes"
        />
        <TabButton
          active={tab === "design"}
          onClick={() => setTab("design")}
          icon={<SlidersHorizontal className="size-3.5" />}
          label="Design"
        />
      </div>
      <div className="min-h-0 flex-1">
        {tab === "assistant" && (
          <AiAssistantPanel enabled={phase === "resume"} />
        )}
        {tab === "changes" && (
          <ChangesPanel resumeId={resumeId} enabled={phase === "resume"} />
        )}
        {tab === "design" && <DesignPanel phase={phase} />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold transition-all",
        active
          ? "bg-slate-100 text-slate-900 shadow-sm"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
      )}
      aria-pressed={active}
    >
      {icon}
      {label}
    </button>
  );
}
