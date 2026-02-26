import MarkdownIt from "markdown-it";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

type MathSegmentType = "text" | "inline" | "block";

type MathSegment = {
  type: MathSegmentType;
  value: string;
};

const markdownParser = new MarkdownIt({
  html: true,
  linkify: true,
});

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

turndown.use(gfm);

turndown.addRule("mathInline", {
  filter(node) {
    return node.nodeName === "SPAN" && (node as HTMLElement).hasAttribute("data-math-inline");
  },
  replacement(_content, node) {
    const formula = (node as HTMLElement).getAttribute("data-math-inline") || "";
    if (!formula) return "";
    return `$${formula}$`;
  },
});

turndown.addRule("mathBlock", {
  filter(node) {
    if (node.nodeName !== "DIV" && node.nodeName !== "SPAN") return false;
    return (node as HTMLElement).hasAttribute("data-math-block");
  },
  replacement(_content, node) {
    const formula = (node as HTMLElement).getAttribute("data-math-block") || "";
    if (!formula) return "";
    return `\n\n$$\n${formula}\n$$\n\n`;
  },
});

function isEscaped(input: string, index: number): boolean {
  let slashCount = 0;
  for (let i = index - 1; i >= 0 && input.charAt(i) === "\\"; i -= 1) {
    slashCount += 1;
  }
  return slashCount % 2 === 1;
}

function findClosingDelimiter(input: string, fromIndex: number, block: boolean): number {
  if (block) {
    for (let i = fromIndex; i + 1 < input.length; i += 1) {
      if (input.charAt(i) === "$" && input.charAt(i + 1) === "$" && !isEscaped(input, i)) {
        return i;
      }
    }
    return -1;
  }

  for (let i = fromIndex; i < input.length; i += 1) {
    const ch = input.charAt(i);
    if (ch === "\n" || ch === "\r") return -1;
    if (ch !== "$") continue;
    if (isEscaped(input, i)) continue;
    if (i - 1 >= 0 && input.charAt(i - 1) === "$") continue;
    if (i + 1 < input.length && input.charAt(i + 1) === "$") continue;
    return i;
  }
  return -1;
}

function appendPlain(segments: MathSegment[], plain: string[]): void {
  if (plain.length === 0) return;
  segments.push({ type: "text", value: plain.join("") });
  plain.length = 0;
}

function parseMathSegments(input: string): MathSegment[] {
  const segments: MathSegment[] = [];
  const plain: string[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input.charAt(i);
    if (ch !== "$" || isEscaped(input, i)) {
      plain.push(ch);
      i += 1;
      continue;
    }

    const block = i + 1 < input.length && input.charAt(i + 1) === "$" && !isEscaped(input, i + 1);
    const closeIndex = findClosingDelimiter(input, i + (block ? 2 : 1), block);
    if (closeIndex < 0) {
      plain.push(ch);
      i += 1;
      continue;
    }

    const formula = input.substring(i + (block ? 2 : 1), closeIndex).trim();
    if (!formula) {
      plain.push(input.substring(i, closeIndex + (block ? 2 : 1)));
      i = closeIndex + (block ? 2 : 1);
      continue;
    }

    appendPlain(segments, plain);
    segments.push({
      type: block ? "block" : "inline",
      value: formula,
    });
    i = closeIndex + (block ? 2 : 1);
  }

  appendPlain(segments, plain);
  return segments;
}

function isSkippedTag(tagName: string): boolean {
  const lowered = tagName.toLowerCase();
  return lowered === "pre" || lowered === "code" || lowered === "script" || lowered === "style";
}

function replaceMathInTextNode(textNode: Text): void {
  const raw = textNode.textContent || "";
  if (!raw || raw.indexOf("$") < 0) return;

  const segments = parseMathSegments(raw);
  if (segments.length === 0) return;
  if (segments.length === 1 && segments[0].type === "text") return;

  const parent = textNode.parentNode;
  if (!parent) return;
  const ownerDocument = parent.ownerDocument || document;

  for (const segment of segments) {
    if (!segment.value) continue;
    if (segment.type === "text") {
      parent.insertBefore(ownerDocument.createTextNode(segment.value), textNode);
      continue;
    }

    const node = ownerDocument.createElement("span");
    if (segment.type === "block") {
      node.setAttribute("data-math-block", segment.value);
    } else {
      node.setAttribute("data-math-inline", segment.value);
    }
    parent.insertBefore(node, textNode);
  }

  parent.removeChild(textNode);
}

function replaceMathInElement(element: Element): void {
  const children = Array.from(element.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) {
      replaceMathInTextNode(child as Text);
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    const childElement = child as Element;
    if (isSkippedTag(childElement.tagName)) continue;
    replaceMathInElement(childElement);
  }
}

function injectMathMarkers(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  replaceMathInElement(doc.body);
  return doc.body.innerHTML;
}

export function markdownToHtmlBestEffort(markdownRaw: string): string {
  const markdown = String(markdownRaw || "").trim();
  if (!markdown) return "";
  const rendered = markdownParser.render(markdown);
  return injectMathMarkers(rendered).trim();
}

export function htmlToMarkdownBestEffort(htmlRaw: string): string {
  const html = String(htmlRaw || "").trim();
  if (!html) return "";
  return turndown.turndown(html).trim();
}

export function extractPlainTextFromHtml(htmlRaw: string): string {
  const html = String(htmlRaw || "").trim();
  if (!html) return "";

  if (typeof window === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
}
