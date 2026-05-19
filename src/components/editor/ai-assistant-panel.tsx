"use client";

import { useRef, useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDesignChat, type ChatTurn } from "@/hooks/useDesignChat";
import { useDebouncedAutosave } from "@/hooks/useDebouncedAutosave";
import { mergeThemeDefaults } from "@/lib/resume-theme";
import { useResumeStore } from "@/stores/resumeStore";
import { cn } from "@/lib/utils";

type AiAssistantPanelProps = {
  enabled?: boolean;
};

export function AiAssistantPanel({ enabled = true }: AiAssistantPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: "assistant",
      content:
        "Ask me to adjust colors, fonts, or switch templates. Example: “Use a navy sidebar with serif headings.”",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const theme = useResumeStore((s) => s.theme);
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate);
  const setTheme = useResumeStore((s) => s.setTheme);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const triggerAutosave = useDebouncedAutosave();
  const chat = useDesignChat();

  const send = async () => {
    const text = input.trim();
    if (!text || !enabled) return;
    setInput("");
    const userTurn: ChatTurn = { role: "user", content: text };
    const nextHistory = [...messages, userTurn];
    setMessages(nextHistory);

    try {
      const merged = mergeThemeDefaults(theme);
      const result = await chat.mutateAsync({
        message: text,
        theme: merged as Record<string, string>,
        template_id: selectedTemplate,
        history: messages.filter((m) => m.role === "user" || m.role === "assistant"),
      });

      if (result.theme && Object.keys(result.theme).length > 0) {
        setTheme(result.theme);
      }
      if (result.template_id) {
        setTemplate(result.template_id);
      }
      triggerAutosave();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.message },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't update the design. Check your API key and try again.",
        },
      ]);
    }

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <MessageSquare className="size-4 text-violet-600" />
          Design assistant
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          Chat to refine layout, colors, and typography on the canvas.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4"
      >
        {messages.map((msg, i) => (
          <div
            key={`${msg.role}-${i}`}
            className={cn(
              "max-w-[95%] rounded-xl px-3 py-2 text-sm leading-relaxed",
              msg.role === "user"
                ? "ml-auto bg-violet-600 text-white"
                : "bg-slate-100 text-slate-800",
            )}
          >
            {msg.content}
          </div>
        ))}
        {chat.isPending && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="size-3.5 animate-spin" />
            Updating design…
          </div>
        )}
      </div>

      <div className="shrink-0 border-t p-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            disabled={!enabled || chat.isPending}
            placeholder="Describe the look you want…"
            className="min-h-[44px] flex-1 resize-none rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 disabled:opacity-60"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            className="shrink-0 self-end"
            disabled={!enabled || chat.isPending || !input.trim()}
            onClick={() => void send()}
            aria-label="Send"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
