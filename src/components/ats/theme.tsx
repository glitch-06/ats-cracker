import { useEffect, useState } from "react";

/**
 * Dark / light mode toggle.
 * Theme lives in local React state (default: dark) and is mirrored onto
 * <html class="dark"> so Tailwind's dark variant applies.
 */
export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}

export function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: "dark" | "light";
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle colour mode"
      className="lift flex h-9 w-9 items-center justify-center border-2 border-border-strong text-foreground hover:bg-signal hover:text-signal-foreground"
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M19.1 4.9l-1.5 1.5M6.4 17.6l-1.5 1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path
            d="M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
