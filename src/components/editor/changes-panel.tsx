"use client";

import { useMemo } from "react";
import {
  Sparkles,
  AlertCircle,
  Wand2,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

import { computeResumeDiff, type ResumeChange } from "@/lib/resume-diff";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/stores/resumeStore";
import type { Resume } from "@/lib/types/resume";

type ChangesPanelProps = {
  originalResume?: Partial<Resume> | null;
};

const AREA_LABEL: Record<ResumeChange["area"], string> = {
  headline: "Headline",
  summary: "Summary",
  contact: "Contact",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
};

const KIND_META: Record<
  ResumeChange["kind"],
  { label: string; icon: LucideIcon; chipClass: string; ring: string }
> = {
  added: {
    label: "Added",
    icon: Sparkles,
    chipClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    ring: "ring-emerald-200/70 bg-emerald-50/40",
  },
  improved: {
    label: "Improved",
    icon: Wand2,
    chipClass: "bg-blue-50 text-blue-700 ring-blue-200",
    ring: "ring-blue-200/70 bg-blue-50/40",
  },
  missing: {
    label: "Missing",
    icon: AlertCircle,
    chipClass: "bg-amber-50 text-amber-800 ring-amber-200",
    ring: "ring-amber-200/70 bg-amber-50/40",
  },
};

export function ChangesPanel({ originalResume }: ChangesPanelProps) {
  const resume = useResumeStore((s) => s.resume);

  const diff = useMemo(
    () => computeResumeDiff(originalResume, resume),
    [originalResume, resume],
  );

  const total = diff.added.length + diff.improved.length + diff.missing.length;

  if (!originalResume) {
    return (
      <div className="bg-background flex h-full min-h-0 flex-col">
        <div className="border-b p-5">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
            Changes
          </h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-slate-400">
          Upload and upgrade a resume to see what was added, improved, or
          missing.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-full min-h-0 flex-col">
      <div className="border-b p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
            Changes
          </h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {total}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat n={diff.added.length} label="Added" tone="emerald" />
          <Stat n={diff.improved.length} label="Improved" tone="blue" />
          <Stat n={diff.missing.length} label="Missing" tone="amber" />
        </div>
      </div>
      <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-4">
        {total === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-slate-400">
            <CheckCircle2 className="size-6 text-emerald-400" />
            <p>No structural diff yet — the upgrade is in progress.</p>
          </div>
        ) : (
          <>
            <ChangeGroup title="Added" items={diff.added} kind="added" />
            <ChangeGroup title="Improved" items={diff.improved} kind="improved" />
            <ChangeGroup title="Missing" items={diff.missing} kind="missing" />
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  n,
  label,
  tone,
}: {
  n: number;
  label: string;
  tone: "emerald" | "blue" | "amber";
}) {
  const toneCls = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-800",
  }[tone];
  return (
    <div className={cn("rounded-lg px-2 py-2", toneCls)}>
      <div className="text-base font-bold leading-none">{n}</div>
      <div className="mt-1 text-[10px] tracking-wider uppercase opacity-80">
        {label}
      </div>
    </div>
  );
}

function ChangeGroup({
  title,
  items,
  kind,
}: {
  title: string;
  items: ResumeChange[];
  kind: ResumeChange["kind"];
}) {
  if (items.length === 0) return null;
  const meta = KIND_META[kind];
  const Icon = meta.icon;

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-3.5 text-slate-500" />
        <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {title}
        </h3>
        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
          {items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((c) => (
          <li
            key={c.id}
            className={cn(
              "rounded-lg p-3 ring-1 ring-inset transition-colors",
              meta.ring,
            )}
          >
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ring-1 ring-inset",
                  meta.chipClass,
                )}
              >
                {AREA_LABEL[c.area]}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-snug text-slate-700">
              {c.detail}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
