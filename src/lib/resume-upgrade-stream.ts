import { apiClient } from "@/lib/api-client";
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

function isReadableStream(value: unknown): value is ReadableStream<Uint8Array> {
  return (
    typeof value === "object" &&
    value !== null &&
    "getReader" in value &&
    typeof (value as ReadableStream<Uint8Array>).getReader === "function"
  );
}

export async function consumeResumeGenerateSse(
  body: GenerateRequestBody,
  signal: AbortSignal | undefined,
  handlers: {
    onPayload: (payload: { delta?: string; error?: unknown }) => void;
    onDone: () => void;
  },
): Promise<void> {
  const response = await apiClient.post<unknown>(GENERATE_PATH, body, {
    adapter: "fetch",
    responseType: "stream",
    signal,
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
  });

  const stream = response.data;
  if (!isReadableStream(stream)) {
    throw new Error("Generate response is not a readable stream");
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let chunk = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunk += decoder.decode(value, { stream: true });

    const frames = chunk.split("\n\n");
    chunk = frames.pop() ?? "";

    for (const frame of frames) {
      if (!frame.startsWith("data: ")) continue;
      const payload = frame.slice(6);
      if (payload === "[DONE]") {
        handlers.onDone();
        return;
      }
      const parsed = JSON.parse(payload) as {
        delta?: string;
        error?: unknown;
      };
      handlers.onPayload(parsed);
      if (parsed.error) return;
    }
  }
}
