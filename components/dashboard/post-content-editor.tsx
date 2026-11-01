"use client";

import {
  CodeTabsExtension,
  createCodeTabsContent,
} from "@/components/dashboard/code-tabs-extension";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { StarterKit } from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

const toolbarButtonClass =
  "rounded border border-foreground/15 px-2.5 py-1.5 text-sm hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40";
const colorPalette = [
  { label: "yellow", value: "#fff59d" },
  { label: "green", value: "#c8e6c9" },
  { label: "blue", value: "#bbdefb" },
  { label: "pink", value: "#f8bbd0" },
];
const fontSizes = ["12px", "14px", "16px", "18px", "24px", "32px"];

function isAllowedUrl(value: string, image = false) {
  try {
    const protocol = new URL(value).protocol;
    return image
      ? protocol === "http:" || protocol === "https:"
      : ["http:", "https:", "mailto:"].includes(protocol);
  } catch {
    return false;
  }
}

export default function PostContentEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string, text: string) => void;
}) {
  const t = useTranslations("editor");
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyleKit,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Image.configure({ allowBase64: false }),
      CodeTabsExtension,
    ],
    content: value,
    immediatelyRender: false,
    onCreate: ({ editor: currentEditor }) =>
      onChange(currentEditor.getHTML(), currentEditor.getText()),
    onUpdate: ({ editor: currentEditor }) =>
      onChange(currentEditor.getHTML(), currentEditor.getText()),
    editorProps: {
      attributes: {
        id: "post-content",
        "aria-label": t("ariaLabel"),
        "aria-multiline": "true",
        class:
          "min-h-64 px-3 py-3 text-sm leading-7 outline-none [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-foreground/25 [&_blockquote]:pl-4 [&_h2]:my-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:my-3 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_li]:ml-5 [&_ol]:my-3 [&_ol]:list-decimal [&_p]:my-3 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-foreground/5 [&_pre]:p-3 [&_ul]:my-3 [&_ul]:list-disc",
      },
    },
  });

  return (
    <div className="overflow-hidden rounded-md border border-foreground/20 bg-background focus-within:border-foreground">
      <div
        aria-label={t("toolbar")}
        className="flex flex-wrap gap-2 border-b border-foreground/10 p-2"
        role="toolbar"
      >
        <button
          type="button"
          aria-label={t("bold")}
          aria-pressed={editor?.isActive("bold") ?? false}
          className={`${toolbarButtonClass} font-bold`}
          disabled={!editor?.can().chain().focus().toggleBold().run()}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          aria-label={t("italic")}
          aria-pressed={editor?.isActive("italic") ?? false}
          className={`${toolbarButtonClass} italic`}
          disabled={!editor?.can().chain().focus().toggleItalic().run()}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          aria-label={t("strike")}
          aria-pressed={editor?.isActive("strike") ?? false}
          className={`${toolbarButtonClass} line-through`}
          disabled={!editor?.can().chain().focus().toggleStrike().run()}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          S
        </button>
        <button
          type="button"
          aria-label={t("underline")}
          aria-pressed={editor?.isActive("underline") ?? false}
          className={`${toolbarButtonClass} underline`}
          disabled={!editor?.can().chain().focus().toggleUnderline().run()}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          U
        </button>
        <label className={`${toolbarButtonClass} flex items-center gap-2`}>
          {t("textColor")}
          <input
            aria-label={t("textColor")}
            type="color"
            defaultValue="#222222"
            className="size-5 cursor-pointer border-0 bg-transparent p-0"
            onChange={(event) =>
              editor?.chain().focus().setColor(event.target.value).run()
            }
          />
        </label>
        <label className={`${toolbarButtonClass} flex items-center gap-2`}>
          {t("backgroundColor")}
          <input
            aria-label={t("backgroundColor")}
            type="color"
            defaultValue="#fff59d"
            className="size-5 cursor-pointer border-0 bg-transparent p-0"
            onChange={(event) =>
              editor
                ?.chain()
                .focus()
                .setBackgroundColor(event.target.value)
                .run()
            }
          />
        </label>
        {colorPalette.map((color) => (
          <button
            key={color.value}
            type="button"
            aria-label={t("highlight", {
              color: t(color.label).toLowerCase(),
            })}
            title={t("highlight", { color: t(color.label).toLowerCase() })}
            className={`${toolbarButtonClass} size-9`}
            style={{ backgroundColor: color.value }}
            onClick={() =>
              editor?.chain().focus().toggleHighlight({ color: color.value }).run()
            }
          >
            Aa
          </button>
        ))}
        <label className="sr-only" htmlFor="post-editor-font-size">
          {t("fontSize")}
        </label>
        <select
          id="post-editor-font-size"
          aria-label={t("fontSize")}
          defaultValue=""
          className={`${toolbarButtonClass} bg-background`}
          onChange={(event) => {
            if (event.target.value) {
              editor?.chain().focus().setFontSize(event.target.value).run();
            } else {
              editor?.chain().focus().unsetFontSize().run();
            }
          }}
        >
          <option value="">{t("size")}</option>
          {fontSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-label={t("heading", { level: 2 })}
          aria-pressed={editor?.isActive("heading", { level: 2 }) ?? false}
          className={toolbarButtonClass}
          disabled={!editor?.can().chain().focus().toggleHeading({ level: 2 }).run()}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>
        <button
          type="button"
          aria-label={t("heading", { level: 3 })}
          aria-pressed={editor?.isActive("heading", { level: 3 }) ?? false}
          className={toolbarButtonClass}
          disabled={!editor?.can().chain().focus().toggleHeading({ level: 3 }).run()}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </button>
        {(["left", "center", "right", "justify"] as const).map(
          (alignment) => (
            <button
              key={alignment}
              type="button"
              aria-label={t("align", {
                alignment: t(alignment),
              })}
              aria-pressed={editor?.isActive({ textAlign: alignment }) ?? false}
              className={toolbarButtonClass}
              onClick={() =>
                editor?.chain().focus().setTextAlign(alignment).run()
              }
            >
              {t(alignment)}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label={t("bulletList")}
          aria-pressed={editor?.isActive("bulletList") ?? false}
          className={toolbarButtonClass}
          disabled={!editor?.can().chain().focus().toggleBulletList().run()}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          {t("list")}
        </button>
        <button
          type="button"
          aria-label={t("orderedList")}
          aria-pressed={editor?.isActive("orderedList") ?? false}
          className={toolbarButtonClass}
          disabled={!editor?.can().chain().focus().toggleOrderedList().run()}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          1. {t("list")}
        </button>
        <button
          type="button"
          aria-label={t("quote")}
          aria-pressed={editor?.isActive("blockquote") ?? false}
          className={toolbarButtonClass}
          disabled={!editor?.can().chain().focus().toggleBlockquote().run()}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          {t("quote")}
        </button>
        <button
          type="button"
          aria-label={t("code")}
          aria-pressed={editor?.isActive("codeBlock") ?? false}
          className={toolbarButtonClass}
          disabled={!editor?.can().chain().focus().toggleCodeBlock().run()}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          {t("code")}
        </button>
        <button
          type="button"
          aria-label={t("insertLink")}
          className={toolbarButtonClass}
          onClick={() => {
            const href = window.prompt(t("linkPrompt"));
            if (!href) return;
            if (!isAllowedUrl(href.trim())) {
              toast.error(t("invalidLink"));
              return;
            }
            editor
              ?.chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: href.trim() })
              .run();
          }}
        >
          {t("link")}
        </button>
        <button
          type="button"
          aria-label={t("removeLink")}
          className={toolbarButtonClass}
          disabled={!editor?.isActive("link")}
          onClick={() => editor?.chain().focus().unsetLink().run()}
        >
          {t("removeLink")}
        </button>
        <button
          type="button"
          aria-label={t("insertImage")}
          className={toolbarButtonClass}
          onClick={() => {
            const src = window.prompt(t("imageUrlPrompt"));
            if (!src) return;
            if (!isAllowedUrl(src.trim(), true)) {
              toast.error(t("invalidImageUrl"));
              return;
            }
            const alt = window.prompt(t("imageAltPrompt"));
            if (!alt?.trim()) {
              toast.error(t("imageAltRequired"));
              return;
            }
            editor
              ?.chain()
              .focus()
              .setImage({ src: src.trim(), alt: alt.trim() })
              .run();
          }}
        >
          {t("image")}
        </button>
        <button
          type="button"
          aria-label={t("insertSeparator")}
          className={toolbarButtonClass}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        >
          {t("separator")}
        </button>
        <button
          type="button"
          aria-label={t("clearFormatting")}
          className={toolbarButtonClass}
          onClick={() =>
            editor?.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          {t("clearFormatting")}
        </button>
        <button
          type="button"
          aria-label={t("addCodeTabs")}
          className={toolbarButtonClass}
          onClick={() =>
            editor?.chain().focus().insertContent(createCodeTabsContent()).run()
          }
        >
          + {t("codeTabs")}
        </button>
        <button
          type="button"
          aria-label={t("undo")}
          className={toolbarButtonClass}
          disabled={!editor?.can().chain().focus().undo().run()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          {t("undo")}
        </button>
        <button
          type="button"
          aria-label={t("redo")}
          className={toolbarButtonClass}
          disabled={!editor?.can().chain().focus().redo().run()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          {t("redo")}
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
