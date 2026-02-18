"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
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
  Link2,
  Image as ImageIcon,
} from "lucide-react";
import { uploadMediaFile } from "@/lib/adminApiClient";
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
  children: React.ReactNode;
};

function ToolbarButton({ title, isActive, onClick, disabled, children }: ToolbarButtonProps) {
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

export function RichTextEditor({
  initialContent,
  onChange,
  disabled = false,
  placeholder = "Viết nội dung tại đây...",
}: RichTextEditorProps) {
  const initialContentKey = useMemo(() => serializeInitialContent(initialContent), [initialContent]);
  const lastAppliedRef = useRef<string>("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      ImageNode,
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
    const input = window.prompt("Nhập URL", previousUrl || "https://");
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

    const input = window.prompt("Nhập URL ảnh", "https://");
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

  const handleUploadImageFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      alert("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploadingImage(false);
    }
  };

  if (!editor) {
    return (
      <div className="editor-shell p-4 text-sm text-muted-foreground">
        Đang tải trình soạn thảo...
      </div>
    );
  }

  return (
    <div className="editor-shell">
      <div className="editor-toolbar">
        <ToolbarButton
          title="In đậm"
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="In nghiêng"
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled || !editor.can().chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Gạch chân"
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Tiêu đề 1"
          isActive={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={disabled}
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Tiêu đề 2"
          isActive={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Tiêu đề 3"
          isActive={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={disabled}
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Danh sách chấm"
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Danh sách số"
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Trích dẫn"
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Khối mã"
          isActive={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={disabled}
        >
          <Code2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Đường kẻ ngang"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Liên kết"
          isActive={editor.isActive("link")}
          onClick={handleSetLink}
          disabled={disabled}
        >
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Chèn ảnh bằng URL"
          onClick={handleInsertImageByUrl}
          disabled={disabled}
        >
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title={uploadingImage ? "Đang tải ảnh..." : "Tải ảnh từ máy"}
          onClick={handlePickImageFile}
          disabled={disabled || uploadingImage}
        >
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Hoàn tác"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().chain().focus().undo().run()}
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Làm lại"
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

      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}

