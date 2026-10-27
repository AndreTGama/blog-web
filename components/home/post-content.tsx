"use client";

import sanitizeHtml from "sanitize-html";
import { useEffect, useMemo, useRef } from "react";

const contentOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "a",
    "blockquote",
    "br",
    "button",
    "code",
    "del",
    "div",
    "em",
    "h2",
    "h3",
    "hr",
    "li",
    "img",
    "mark",
    "ol",
    "p",
    "pre",
    "s",
    "strong",
    "span",
    "ul",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    button: [
      "type",
      "role",
      "data-code-tab",
      "data-code-language",
      "aria-selected",
      "tabindex",
    ],
    div: [
      "data-code-tabs",
      "data-code-tabs-bar",
      "data-code-panel",
      "role",
      "aria-label",
      "hidden",
    ],
    h2: ["style"],
    h3: ["style"],
    img: ["src", "alt", "title", "width", "height"],
    mark: ["style"],
    p: ["style"],
    pre: ["role", "aria-label", "hidden"],
    span: ["style"],
  },
  allowedStyles: {
    "*": {
      "background-color": [/^#[\da-f]{3,8}$/i],
      color: [/^#[\da-f]{3,8}$/i],
      "font-size": [/^(?:[1-9]|[1-6]\d|7[0-2])px$/],
      "text-align": [/^(?:left|center|right|justify)$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto"],
};

function getTabs(group: HTMLElement) {
  return {
    buttons: Array.from(
      group.querySelectorAll<HTMLButtonElement>("button[data-code-tab]"),
    ),
    panels: Array.from(
      group.querySelectorAll<HTMLElement>("[data-code-panel]"),
    ),
  };
}

function activateTab(group: HTMLElement, selectedIndex: number) {
  const { buttons, panels } = getTabs(group);
  buttons.forEach((button, index) => {
    const selected = index === selectedIndex;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  panels.forEach((panel, index) => {
    panel.hidden = index !== selectedIndex;
  });
}

export default function PostContent({ content }: { content: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const safeContent = useMemo(
    () => sanitizeHtml(content, contentOptions),
    [content],
  );

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const groups = Array.from(
      root.querySelectorAll<HTMLElement>("[data-code-tabs]"),
    );
    groups.forEach((group) => {
      const { buttons } = getTabs(group);
      const selectedIndex = buttons.findIndex(
        (button) => button.getAttribute("aria-selected") === "true",
      );
      activateTab(group, selectedIndex >= 0 ? selectedIndex : 0);
    });

    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest<HTMLButtonElement>(
        "button[data-code-tab]",
      );
      const group = button?.closest<HTMLElement>("[data-code-tabs]");
      if (!button || !group || !root?.contains(group)) return;

      const { buttons } = getTabs(group);
      const index = buttons.indexOf(button);
      if (index >= 0) activateTab(group, index);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight"
      ) {
        return;
      }
      if (!(event.target instanceof HTMLButtonElement)) return;

      const button = event.target.closest<HTMLButtonElement>(
        "button[data-code-tab]",
      );
      const group = button?.closest<HTMLElement>("[data-code-tabs]");
      if (!button || !group || !root?.contains(group)) return;

      const { buttons } = getTabs(group);
      const index = buttons.indexOf(button);
      if (index < 0 || buttons.length < 2) return;

      event.preventDefault();
      const nextIndex =
        (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) %
        buttons.length;
      buttons[nextIndex].focus();
      activateTab(group, nextIndex);
    }

    root.addEventListener("click", handleClick);
    root.addEventListener("keydown", handleKeyDown);
    return () => {
      root.removeEventListener("click", handleClick);
      root.removeEventListener("keydown", handleKeyDown);
    };
  }, [safeContent]);

  return (
    <div
      ref={contentRef}
      className="post-content mt-10 break-words whitespace-pre-wrap text-base leading-8 text-foreground/85"
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  );
}
