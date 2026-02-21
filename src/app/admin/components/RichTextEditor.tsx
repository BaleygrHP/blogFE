"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Columns3,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Undo2,
  Redo2,
  Rows3,
  Table2,
  Link2,
  Image as ImageIcon,
  FileUp,
  Trash2,
} from "lucide-react";
import { uploadMediaFile } from "@/lib/adminApiClient";
import { renderMathInContainer } from "@/lib/renderMath";
import type { EditorInitialContent, RichEditorSnapshot } from "@/lib/editorContent";

type RichTextEditorProps = {
  initialContent: EditorInitialContent;
  onChange: (snapshot: RichEditorSnapshot) => void;
  disabled?: boolean;
  placeholder?: string;
};

type ToolbarButtonProps = {
  title: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
};

const FONT_SIZE_OPTIONS = [
  { label: "Mặc định", value: "default" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
];

const FONT_FAMILY_OPTIONS = [
  { label: "Mặc định", value: "default" },
  {
    label: "Serif",
    value: "var(--font-body), \"Noto Serif\", \"Times New Roman\", serif",
  },
  {
    label: "Sans",
    value: "var(--font-ui), system-ui, -apple-system, \"Segoe UI\", Arial, sans-serif",
  },
  { label: "Monospace", value: "var(--font-mono), monospace" },
];

function ToolbarButton({
  title,
  isActive,
  onClick,
  disabled,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`editor-btn ${isActive ? "editor-btn-active" : ""}`}
    >
      {children}
    </button>
  );
}

function serializeInitialContent(content: EditorInitialContent): string {
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content);
  } catch {
    return "";
  }
}

function normalizeLink(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z][\w+.-]*:/.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function sanitizeMathFormula(raw: string): string {
  let next = raw.trim();
  if (!next) return "";

  if (next.startsWith("$$") && next.endsWith("$$") && next.length > 4) {
    next = next.slice(2, -2).trim();
  } else if (next.startsWith("$") && next.endsWith("$") && next.length > 2) {
    next = next.slice(1, -1).trim();
  }

  return next;
}

function toMediaDownloadUrl(mediaId: string, contentUrl?: string | null): string {
  if (!contentUrl) return `/api/public/media/${mediaId}/download`;
  try {
    const parsed = new URL(contentUrl, window.location.origin);
    if (parsed.pathname.endsWith("/content")) {
      parsed.pathname = `${parsed.pathname.slice(0, -"/content".length)}/download`;
    } else {
      parsed.pathname = `/api/public/media/${mediaId}/download`;
    }
    return parsed.toString();
  } catch {
    return `/api/public/media/${mediaId}/download`;
  }
}

const ImageNode = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "img[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },
});

const MathInlineNode = Node.create({
  name: "mathInline",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      formula: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-math-inline") || "",
        renderHTML: (attributes) => ({
          "data-math-inline": attributes.formula || "",
        }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "span[data-math-inline]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "math-inline-node",
        contenteditable: "false",
      }),
    ];
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("span");
      dom.className = "math-inline-node";
      dom.contentEditable = "false";

      const setFormula = (formula: string) => {
        dom.innerHTML = "";
        dom.setAttribute("data-math-inline", formula);
        renderMathInContainer(dom);
        if (!formula) dom.textContent = "$?$";
      };

      setFormula(String(node.attrs.formula || ""));

      return {
        dom,
        update(updatedNode) {
          if (updatedNode.type.name !== "mathInline") return false;
          setFormula(String(updatedNode.attrs.formula || ""));
          return true;
        },
      };
    };
  },
});

const MathBlockNode = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      formula: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-math-block") || "",
        renderHTML: (attributes) => ({
          "data-math-block": attributes.formula || "",
        }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-math-block]" }, { tag: "span[data-math-block]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        class: "math-block-node",
        contenteditable: "false",
      }),
    ];
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div");
      dom.className = "math-block-node";
      dom.contentEditable = "false";

      const setFormula = (formula: string) => {
        dom.innerHTML = "";
        dom.setAttribute("data-math-block", formula);
        renderMathInContainer(dom);
        if (!formula) dom.textContent = "$$?$$";
      };

      setFormula(String(node.attrs.formula || ""));

      return {
        dom,
        update(updatedNode) {
          if (updatedNode.type.name !== "mathBlock") return false;
          setFormula(String(updatedNode.attrs.formula || ""));
          return true;
        },
      };
    };
  },
});

export function RichTextEditor({
  initialContent,
  onChange,
  disabled = false,
  placeholder = "Write content here...",
}: RichTextEditorProps) {
  const initialContentKey = useMemo(() => serializeInitialContent(initialContent), [initialContent]);
  const lastAppliedRef = useRef<string>("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const emitSnapshot = useCallback(
    (instance: Editor) => {
      onChange({
        html: instance.getHTML(),
        json: JSON.stringify(instance.getJSON()),
        text: instance.getText(),
      });
    },
    [onChange]
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    content: initialContent,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextStyle,
      FontFamily,
      FontSize,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph", "tableCell", "tableHeader"],
      }),
      ImageNode,
      MathInlineNode,
      MathBlockNode,
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    onCreate({ editor: instance }) {
      lastAppliedRef.current = initialContentKey;
      emitSnapshot(instance);
    },
    onUpdate({ editor: instance }) {
      emitSnapshot(instance);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    if (lastAppliedRef.current === initialContentKey) return;

    editor.commands.setContent(initialContent, { emitUpdate: false });
    lastAppliedRef.current = initialContentKey;
    emitSnapshot(editor);
  }, [editor, initialContent, initialContentKey, emitSnapshot]);

  const handleSetLink = () => {
    if (!editor || disabled) return;
    const previousUrl = String(editor.getAttributes("link").href ?? "");
    const input = window.prompt("Enter URL", previousUrl || "https://");
    if (input === null) return;

    const url = normalizeLink(input);
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleInsertImageByUrl = () => {
    if (!editor || disabled) return;

    const input = window.prompt("Enter image URL", "https://");
    if (input === null) return;

    const src = input.trim();
    if (!src) return;

    editor
      .chain()
      .focus()
      .insertContent({ type: "image", attrs: { src, alt: "", title: "" } })
      .run();
  };

  const handlePickImageFile = () => {
    if (disabled || uploadingImage) return;
    imageInputRef.current?.click();
  };

  const handleUploadImageFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file || !editor || disabled) return;

    try {
      setUploadingImage(true);
      const uploaded = await uploadMediaFile({
        file,
        kind: "IMAGE",
        title: file.name,
        alt: file.name,
      });

      editor
        .chain()
        .focus()
        .insertContent({
          type: "image",
          attrs: {
            src: uploaded.url,
            alt: uploaded.alt || uploaded.title || file.name,
            title: uploaded.title || file.name,
          },
        })
        .run();
    } catch (errorValue) {
      console.error("Failed to upload image for editor:", errorValue);
      alert("Cannot upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePickDocumentFile = () => {
    if (disabled || uploadingDocument) return;
    documentInputRef.current?.click();
  };

  const handleUploadDocumentFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file || !editor || disabled) return;

    try {
      setUploadingDocument(true);
      const uploaded = await uploadMediaFile({
        file,
        kind: "FILE",
        title: file.name,
      });

      const downloadUrl = toMediaDownloadUrl(uploaded.id, uploaded.url);
      const label = uploaded.title || uploaded.originalFileName || file.name;

      editor
        .chain()
        .focus()
        .insertContent({
          type: "paragraph",
          content: [
            {
              type: "text",
              text: label,
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: downloadUrl,
                  },
                },
              ],
            },
          ],
        })
        .run();
    } catch (errorValue) {
      console.error("Failed to upload file for editor:", errorValue);
      alert("Cannot upload file. Please try again.");
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleInsertInlineMath = () => {
    if (!editor || disabled) return;
    const input = window.prompt("Inline math formula (without $...$)", "a+b=c");
    if (input === null) return;
    const formula = sanitizeMathFormula(input);
    if (!formula) return;
    editor.chain().focus().insertContent({ type: "mathInline", attrs: { formula } }).run();
  };

  const handleInsertBlockMath = () => {
    if (!editor || disabled) return;
    const input = window.prompt("Block math formula (without $$...$$)", "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}");
    if (input === null) return;
    const formula = sanitizeMathFormula(input);
    if (!formula) return;
    editor.chain().focus().insertContent({ type: "mathBlock", attrs: { formula } }).run();
  };

  const handleInsertTable = () => {
    if (!editor || disabled) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const handleSetTextAlign = (align: "left" | "center" | "right") => {
    if (!editor || disabled) return;
    editor.chain().focus().setTextAlign(align).run();
  };

  const handleSetFontSize = (value: string) => {
    if (!editor || disabled) return;
    if (value === "default") {
      editor.chain().focus().unsetFontSize().run();
      return;
    }
    editor.chain().focus().setFontSize(value).run();
  };

  const handleSetFontFamily = (value: string) => {
    if (!editor || disabled) return;
    if (value === "default") {
      editor.chain().focus().unsetFontFamily().run();
      return;
    }
    editor.chain().focus().setFontFamily(value).run();
  };

  if (!editor) {
    return <div className="editor-shell p-4 text-sm text-muted-foreground">Loading editor...</div>;
  }

  return (
    <div className="editor-shell">
      <div className="editor-toolbar">
        <select
          className="editor-select"
          defaultValue="default"
          onChange={(event) => handleSetFontFamily(event.target.value)}
          disabled={disabled}
          title="Font chữ"
        >
          {FONT_FAMILY_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="editor-select"
          defaultValue="default"
          onChange={(event) => handleSetFontSize(event.target.value)}
          disabled={disabled}
          title="Cỡ chữ"
        >
          {FONT_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ToolbarButton
          title="Bold"
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled || !editor.can().chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Heading 1"
          isActive={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={disabled}
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          isActive={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          isActive={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={disabled}
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Bullet list"
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Ordered list"
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Block quote"
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Code block"
          isActive={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={disabled}
        >
          <Code2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Link" isActive={editor.isActive("link")} onClick={handleSetLink} disabled={disabled}>
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Insert image URL" onClick={handleInsertImageByUrl} disabled={disabled}>
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title={uploadingImage ? "Uploading image..." : "Upload image"}
          onClick={handlePickImageFile}
          disabled={disabled || uploadingImage}
        >
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title={uploadingDocument ? "Uploading file..." : "Upload DOC/DOCX/PDF"}
          onClick={handlePickDocumentFile}
          disabled={disabled || uploadingDocument}
        >
          <FileUp className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Insert inline math" onClick={handleInsertInlineMath} disabled={disabled}>
          <span className="text-xs font-semibold">$x$</span>
        </ToolbarButton>
        <ToolbarButton title="Insert block math" onClick={handleInsertBlockMath} disabled={disabled}>
          <span className="text-xs font-semibold">$$</span>
        </ToolbarButton>
        <ToolbarButton title="Insert table" onClick={handleInsertTable} disabled={disabled}>
          <Table2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Add row"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={disabled}
        >
          <Rows3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Add column"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={disabled}
        >
          <Columns3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Delete row"
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={disabled}
        >
          <span className="text-[10px] font-semibold">R-</span>
        </ToolbarButton>
        <ToolbarButton
          title="Delete column"
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={disabled}
        >
          <span className="text-[10px] font-semibold">C-</span>
        </ToolbarButton>
        <ToolbarButton
          title="Delete table"
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={disabled}
        >
          <Trash2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Align left"
          isActive={editor.isActive({ textAlign: "left" })}
          onClick={() => handleSetTextAlign("left")}
          disabled={disabled}
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Align center"
          isActive={editor.isActive({ textAlign: "center" })}
          onClick={() => handleSetTextAlign("center")}
          disabled={disabled}
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Align right"
          isActive={editor.isActive({ textAlign: "right" })}
          onClick={() => handleSetTextAlign("right")}
          disabled={disabled}
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().chain().focus().undo().run()}
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().chain().focus().redo().run()}
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUploadImageFile}
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
        className="hidden"
        onChange={handleUploadDocumentFile}
      />

      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
