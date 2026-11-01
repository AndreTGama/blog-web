import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type CodeTab = {
  language: string;
  code: string;
};

function normalizeTabs(value: unknown): CodeTab[] {
  if (!Array.isArray(value)) return [];

  const tabs = value.filter(
    (tab): tab is CodeTab =>
      typeof tab === "object" &&
      tab !== null &&
      "language" in tab &&
      typeof tab.language === "string" &&
      "code" in tab &&
      typeof tab.code === "string",
  );

  return tabs;
}

function readTabsFromHtml(element: HTMLElement): CodeTab[] {
  const panels = new Map(
    Array.from(element.querySelectorAll<HTMLElement>("[data-code-panel]")).map(
      (panel) => [panel.getAttribute("data-code-panel") ?? "", panel],
    ),
  );

  const tabs = Array.from(
    element.querySelectorAll<HTMLButtonElement>("button[data-code-tab]"),
  ).map((button, index) => {
    const panel = panels.get(String(index));
    const codeElement = panel?.querySelector("code");

    return {
      language: button.getAttribute("data-code-language") ?? button.textContent ?? "",
      code: codeElement?.textContent ?? panel?.textContent ?? "",
    };
  });

  return normalizeTabs(tabs);
}

function CodeTabsNodeView({ node, updateAttributes }: NodeViewProps) {
  const t = useTranslations("editor");
  const tabs = normalizeTabs(node.attrs.tabs);
  const [activeIndex, setActiveIndex] = useState(0);
  const [newLanguage, setNewLanguage] = useState("");
  const activeTab = tabs[activeIndex];

  function updateTab(index: number, changes: Partial<CodeTab>) {
    updateAttributes({
      tabs: tabs.map((tab, tabIndex) =>
        tabIndex === index ? { ...tab, ...changes } : tab,
      ),
    });
  }

  function addTab() {
    const language = newLanguage.trim();
    if (
      !language ||
      tabs.some((tab) => tab.language.toLowerCase() === language.toLowerCase())
    ) {
      return;
    }

    updateAttributes({ tabs: [...tabs, { language, code: "" }] });
    setActiveIndex(tabs.length);
    setNewLanguage("");
  }

  function removeTab(index: number) {
    const remainingTabs = tabs.filter((_, tabIndex) => tabIndex !== index);
    updateAttributes({ tabs: remainingTabs });
    setActiveIndex(Math.min(activeIndex, remainingTabs.length - 1));
  }

  return (
    <NodeViewWrapper
      as="section"
      aria-label={t("codeExamples")}
      className="my-4 overflow-hidden rounded-md border border-foreground/20 bg-background"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-foreground/10 bg-foreground/[0.04] p-2">
        <div aria-label={t("languageTabs")} className="flex flex-wrap gap-1" role="tablist">
          {tabs.map((tab, index) => (
            <button
              key={`${index}-${tab.language}`}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              onClick={() => setActiveIndex(index)}
              className={`rounded px-3 py-1.5 text-sm ${
                activeIndex === index
                  ? "bg-foreground text-background"
                  : "text-foreground/65 hover:bg-foreground/10"
              }`}
            >
              {tab.language || t("tabNumber", { index: index + 1 })}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            aria-label={t("newLanguage")}
            value={newLanguage}
            onChange={(event) => setNewLanguage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addTab();
              }
            }}
            placeholder={t("newLanguage")}
            className="w-32 rounded border border-foreground/20 bg-background px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={addTab}
            disabled={
              !newLanguage.trim() ||
              tabs.some(
                (tab) =>
                  tab.language.toLowerCase() === newLanguage.trim().toLowerCase(),
              )
            }
            className="rounded border border-foreground/20 px-2.5 py-1.5 text-sm hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("addTab")}
          </button>
        </div>
      </div>
      {activeTab ? (
        <div className="space-y-3 p-3">
          <label className="block text-sm font-medium">
            {t("tabName")}
            <input
              aria-label={t("selectedTabName")}
              value={activeTab.language}
              onChange={(event) =>
                updateTab(activeIndex, { language: event.target.value })
              }
              className="mt-1 w-full rounded border border-foreground/20 bg-background px-2 py-1.5"
            />
          </label>
          <label className="block text-sm font-medium">
            {t("code")}
            <textarea
              aria-label={t("codeTabLabel", {
                language: activeTab.language || t("selectedTab"),
              })}
              rows={8}
              spellCheck={false}
              value={activeTab.code}
              onChange={(event) =>
                updateTab(activeIndex, { code: event.target.value })
              }
              placeholder={t("codeTabPlaceholder", {
                language: activeTab.language || t("code").toLowerCase(),
              })}
              className="mt-1 w-full resize-y rounded border border-foreground/20 bg-background px-3 py-2 font-mono text-sm leading-6"
            />
          </label>
          <button
            type="button"
            onClick={() => removeTab(activeIndex)}
            className="text-sm text-red-700 underline underline-offset-2 dark:text-red-300"
          >
            {t("removeTab", { language: activeTab.language })}
          </button>
        </div>
      ) : (
        <p className="p-3 text-sm text-foreground/60">
          {t("firstTabPrompt")}
        </p>
      )}
    </NodeViewWrapper>
  );
}

export const CodeTabsExtension = Node.create({
  name: "codeTabs",
  group: "block",
  atom: true,
  selectable: true,

  renderText({ node }) {
    return normalizeTabs(node.attrs.tabs)
      .map((tab) => tab.code)
      .join("\n");
  },

  addAttributes() {
    return {
      tabs: {
        default: [],
        parseHTML: (element: HTMLElement) => readTabsFromHtml(element),
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-code-tabs]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const tabs = normalizeTabs(node.attrs.tabs);

    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-code-tabs": "true" }),
      [
        "div",
        { "data-code-tabs-bar": "true", role: "tablist" },
        ...tabs.map((tab, index) => [
          "button",
          {
            type: "button",
            role: "tab",
            "data-code-tab": String(index),
            "data-code-language": tab.language,
            "aria-selected": index === 0 ? "true" : "false",
            tabindex: index === 0 ? "0" : "-1",
          },
          tab.language || `Aba ${index + 1}`,
        ]),
      ],
      ...tabs.map((tab, index) => [
        "div",
        {
          "data-code-panel": String(index),
          role: "tabpanel",
          "aria-label": tab.language || `Aba ${index + 1}`,
          hidden: index !== 0,
        },
        ["pre", ["code", tab.code]],
      ]),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeTabsNodeView);
  },
});

export function createCodeTabsContent() {
  return { type: "codeTabs", attrs: { tabs: [] } };
}
