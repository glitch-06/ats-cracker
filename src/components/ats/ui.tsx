import { useEffect, type ButtonHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Buttons — hard-edged, offset-shadow "plate" language                */
/* ------------------------------------------------------------------ */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "sm" | "md";
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "lift inline-flex items-center justify-center gap-2 border-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-35",
        size === "sm" ? "px-3.5 py-2" : "px-5 py-3",
        variant === "primary" &&
          "border-border-strong bg-signal text-signal-foreground shadow-[4px_4px_0_0_var(--color-border-strong)] hover:shadow-[6px_6px_0_0_var(--color-border-strong)]",
        variant === "secondary" &&
          "border-border-strong bg-transparent text-foreground hover:bg-signal hover:text-signal-foreground",
        variant === "tertiary" &&
          "border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground",
        variant === "danger" &&
          "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export function GlassCard({
  className,
  children,
}: {
  className?: string | undefined;
  children: ReactNode;
}) {
  return <div className={cn("slab p-6", className)}>{children}</div>;
}

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <span
      className={cn(
        "meta inline-flex items-center gap-1.5 border-2 border-border-strong px-2.5 py-1 font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StepNumber({ value }: { value: string }) {
  return (
    <span className="font-display text-5xl leading-none text-signal sm:text-6xl">{value}</span>
  );
}

/**
 * Section header: oversized index number in the gutter, condensed title,
 * and a hairline rule running to the edge of the column.
 */
export function SectionTitle({
  step,
  title,
  subtitle,
}: {
  step?: string | undefined;
  title: string;
  subtitle?: string | undefined;
}) {
  return (
    <div className="mb-5 flex items-start gap-4 border-b-2 border-border-strong pb-4">
      {step ? <StepNumber value={step} /> : null}
      <div className="min-w-0 flex-1 pt-1">
        <h2 className="font-display text-3xl uppercase leading-none tracking-wide sm:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

const fieldStyles =
  "w-full border-2 border-border bg-surface px-3.5 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors duration-150 focus:border-signal focus:outline-none";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldStyles, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldStyles, "resize-y", className)} {...props} />;
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="meta mb-1.5 block text-muted-foreground">{children}</label>;
}

/* ------------------------------------------------------------------ */
/* Icons (inline SVG keeps the bundle dependency-free)                 */
/* ------------------------------------------------------------------ */

export function CheckIcon({ className }: { className?: string | undefined }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4", className)}>
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function Spinner({ className }: { className?: string | undefined }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("h-4 w-4 animate-spin", className)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/90" onClick={onClose} aria-hidden />
      <div className="plate animate-fade-up relative w-full max-w-lg p-6">
        <div className="mb-5 flex items-start justify-between gap-4 border-b-2 border-border-strong pb-3">
          <h3 className="font-display text-2xl uppercase leading-none">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="lift border-2 border-border-strong p-1.5 text-foreground hover:bg-signal hover:text-signal-foreground"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modal, document.body);
  }
  return modal;
}

/* ------------------------------------------------------------------ */
/* Alert card                                                          */
/* ------------------------------------------------------------------ */

export function AlertCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="animate-fade-up border-2 border-destructive bg-destructive/10 p-5">
      <p className="meta text-destructive">⚠ {title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

/** Skeleton block used instead of blank states. */
export function Skeleton({ className }: { className?: string | undefined }) {
  return <div className={cn("animate-pulse border-2 border-border bg-accent/60", className)} />;
}
