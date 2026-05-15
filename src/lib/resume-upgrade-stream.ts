import { apiClient } from "@/lib/api-client";

const UPGRADE_PATH = "/api/resumes/upgrade";

export type ResumeUpgradeRequestBody = {
  raw_text: string;
  target_role?: string;
};

function isReadableStream(value: unknown): value is ReadableStream<Uint8Array> {
  return (
    typeof value === "object" &&
    value !== null &&
    "getReader" in value &&
    typeof (value as ReadableStream<Uint8Array>).getReader === "function"
  );
}

/**
 * POST upgrade stream using Axios with the fetch adapter so the body is a
 * {@link ReadableStream} (XHR cannot do this the same way in the browser).
 */
export async function consumeResumeUpgradeSse(
  body: ResumeUpgradeRequestBody,
  signal: AbortSignal | undefined,
  handlers: {
    onPayload: (payload: { delta?: string; error?: unknown }) => void;
    onDone: () => void;
  }
): Promise<void> {
  const response = await apiClient.post<unknown>(UPGRADE_PATH, body, {
    adapter: "fetch",
    responseType: "stream",
    signal,
    headers: {
      Accept: "text/event-stream",
    },
  });

  const stream = response.data;
  if (!isReadableStream(stream)) {
    throw new Error("Upgrade response is not a readable stream");
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
      const parsed = JSON.parse(payload) as { delta?: string; error?: unknown };
      handlers.onPayload(parsed);
      if (parsed.error) return;
    }
  }
}
