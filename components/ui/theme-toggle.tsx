"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";
const THEME_STORAGE_KEY = "theme";

let currentTheme: Theme = "light";
let hasReadStoredTheme = false;
const subscribers = new Set<() => void>();

const options: { value: Theme; label: string }[] = [
  { value: "light", label: "Ativar tema claro" },
  { value: "dark", label: "Ativar tema escuro" },
];

function getStoredTheme(): Theme {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "dark" ? "dark" : "light";
}

function getThemeSnapshot(): Theme {
  return currentTheme;
}

function updateTheme(theme: Theme) {
  currentTheme = theme;
  hasReadStoredTheme = true;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  subscribers.forEach((subscriber) => subscriber());
}

function subscribeToTheme(onChange: () => void) {
  subscribers.add(onChange);

  if (!hasReadStoredTheme) {
    currentTheme = getStoredTheme();
    hasReadStoredTheme = true;
    applyTheme(currentTheme);
    onChange();
  }

  function handleStorageChange(event: StorageEvent) {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;

    currentTheme = getStoredTheme();
    applyTheme(currentTheme);
    subscribers.forEach((subscriber) => subscriber());
  }

  window.addEventListener("storage", handleStorageChange);

  return () => {
    subscribers.delete(onChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

function applyTheme(theme: Theme) {
  const isDark = theme === "dark";

  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", !isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "light") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4">
        <circle cx="12" cy="12" r="4" stroke="currentColor" />
        <path
          d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
          stroke="currentColor"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-4">
      <path
        d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z"
        stroke="currentColor"
        strokeLinejoin="round"
      />
      <path d="M17 3v4m-2-2h4" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => "light",
  );

  function selectTheme(nextTheme: Theme) {
    updateTheme(nextTheme);
  }

  return (
    <div
      aria-label="Tema de cores"
      className="inline-flex rounded-full bg-foreground/10 p-1 text-foreground"
      role="group"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-label={option.label}
          aria-pressed={theme === option.value}
          onClick={() => selectTheme(option.value)}
          className={`flex size-8 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
            theme === option.value
              ? "bg-background text-foreground shadow-sm"
              : "hover:bg-background/70"
          }`}
        >
          <ThemeIcon theme={option.value} />
        </button>
      ))}
    </div>
  );
}
