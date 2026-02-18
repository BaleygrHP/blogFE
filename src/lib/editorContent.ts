import type { JSONContent } from "@tiptap/core";

export type EditorInitialContent = string | JSONContent;

export type RichEditorSnapshot = {
  html: string;
  json: string;
  text: string;
};

export type PostEditorContentPayload = {
  contentJson: string;
  contentHtml: string;
  contentText: string;
  content: string;
  contentMd: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function looksLikeHtml(raw: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(raw);
}

function tryParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function defaultDocJson(): string {
  return JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph" }],
  });
}

export function toEditorInitialContent(raw: string | undefined): EditorInitialContent {
  if (!raw) return "";

  const trimmed = raw.trim();
  if (!trimmed) return "";

  const parsed = tryParseJson(trimmed);
  if (isRecord(parsed)) {
    if (parsed.type === "doc") {
      return parsed as JSONContent;
    }

    if (parsed.type === "text" && typeof parsed.raw === "string") {
      return parsed.raw;
    }
  }

  if (looksLikeHtml(trimmed)) {
    return trimmed;
  }

  return raw;
}

export function toPostPayloadFromEditor(snapshot: RichEditorSnapshot): PostEditorContentPayload {
  const html = snapshot.html.trim() || "<p></p>";
  const text = snapshot.text || "";
  const json = snapshot.json.trim() || defaultDocJson();

  const validJson = tryParseJson(json);
  const contentJson = validJson ? json : defaultDocJson();

  return {
    contentJson,
    contentHtml: html,
    contentText: text,
    content: html,
    contentMd: html,
  };
}
