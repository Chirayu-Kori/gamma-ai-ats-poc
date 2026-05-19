"use client";

import { useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";

import { mergeThemeDefaults, pageSizeCssVars } from "@/lib/resume-theme";
import { useResumeStore } from "../stores/resumeStore";
import { StreamingSectionEffects } from "./editor/streaming-section-effects";
import { TEMPLATES } from "./templates/registry";
import "./templates/shared-template.css";

export function ResumeCanvas() {
  const templateId = useResumeStore((s) => s.selectedTemplate);
  const theme = useResumeStore((s) => s.theme);
  const resume = useResumeStore((s) => s.resume);
  const status = useResumeStore((s) => s.status);
  const pageVars = pageSizeCssVars(mergeThemeDefaults(theme));

  const wrapperRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const containerWidth = entries[0].contentRect.width;
      if (transformRef.current) {
        const contentWidth = 800;
        const padding = 64; // horizontal space
        const scale = Math.min(containerWidth / (contentWidth + padding), 1);
        transformRef.current.centerView(scale, 0);
      }
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const TemplateConfig = TEMPLATES[templateId] || TEMPLATES["minimal"];
  const Component = TemplateConfig.Component;

  // Empty state — happens briefly while the record is loading after navigation,
  // or if something went wrong with parse/upgrade.
  const isEmpty =
    !resume ||
    (!resume.name &&
      !resume.headline &&
      !resume.summary &&
      (!resume.experience || resume.experience.length === 0));

  if (isEmpty && status !== "generating" && status !== "streaming") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="rounded-full bg-blue-50 p-4">
          <FileText className="size-7 text-blue-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-800">
          Loading your resume…
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          If this stays empty, the upgrade didn&apos;t save. Try opening this
          resume again from the workspace, or re-upload.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="bg-muted/30 flex h-full w-full overflow-hidden print:h-auto print:overflow-visible print:bg-white"
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.2}
        maxScale={2}
        centerOnInit
        limitToBounds={false}
        panning={{ excluded: ["cursor-grab", "ProseMirror"] }}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div className="resume-page-format w-full min-w-0" style={pageVars}>
            <StreamingSectionEffects />
            <Component />
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
