import type { Resume } from "@/lib/types/resume";

const GENERATE_PATH = "/api/resumes/generate";

export type GenerateRequestBody = {
  resume_id?: string;
  resume?: Partial<Resume>;
  source_text?: string;
  jd_text?: string;
  target_role?: string;
  instruction?: string;
};

export type StreamPayload = {
  delta?: string;
  error?: unknown;
  event?: string;
  section_id?: string;
  header?: string;
  index?: number;
  total?: number;
  total_sections?: number;
  resume?: Partial<Resume>;
};

function isReadableStream(value: unknown): value is ReadableStream<Uint8Array> {
  return (
    typeof value === "object" &&
    value !== null &&
    "getReader" in value &&
    typeof (value as ReadableStream<Uint8Array>).getReader === "function"
  );
}

/** Parse one SSE frame (may contain multiple `data:` lines). */
function extractDataPayloads(frame: string): string[] {
  const payloads: string[] = [];
  for (const line of frame.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("data:")) {
      payloads.push(trimmed.slice(5).trimStart());
    }
  }
  return payloads;
}

function dispatchPayload(
  raw: string,
  handlers: {
    onPayload: (payload: StreamPayload) => void;
    onDone: () => void;
  },
): boolean {
  if (raw === "[DONE]") {
    handlers.onDone();
    return true;
  }
  if (!raw) return false;
  const parsed = JSON.parse(raw) as StreamPayload;
  handlers.onPayload(parsed);
  return Boolean(parsed.error);
}

export async function consumeResumeGenerateSse(
  body: GenerateRequestBody,
  signal: AbortSignal | undefined,
  handlers: {
    onPayload: (payload: StreamPayload) => void;
    onDone: () => void;
  },
): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000"}${GENERATE_PATH}`,
    {
      method: "POST",
      signal,
      headers: {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Generate stream failed (${response.status})`);
  }

  const stream = response.body;
  if (!isReadableStream(stream)) {
    throw new Error("Generate response is not a readable stream");
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const processFrames = (): boolean => {
    let sep = buffer.indexOf("\n\n");
    while (sep !== -1) {
      const frame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      for (const payload of extractDataPayloads(frame)) {
        if (dispatchPayload(payload, handlers)) return true;
      }
      sep = buffer.indexOf("\n\n");
    }
    return false;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (value) {
      buffer += decoder.decode(value, { stream: true });
      if (processFrames()) return;
    }
    if (done) {
      buffer += decoder.decode();
      break;
    }
  }

  for (const payload of extractDataPayloads(buffer)) {
    if (dispatchPayload(payload, handlers)) return;
  }

  handlers.onDone();
}
