import { useEffect, useState } from "react";

import { useToast } from "./toast";
import { AlertCard, Button, CheckIcon, GlassCard, SectionTitle, Skeleton, Spinner } from "./ui";

const STEPS = [
  "Preparing and reading your document...",
  "Connecting to server for deep JD analysis...",
  "Optimizing keywords and rewriting bullet points...",
  "Formatting the final DOCX file and injecting links...",
  "Cleaning up temporary files...",
];

type Status = "idle" | "running" | "done" | "error";

/**
 * RUN OPTIMIZATION — a fully mocked pipeline.
 * Each step advances on a ~1.2s timer; no document is processed.
 */
export function RunOptimization({
  canRun,
  onConsumeUse,
  onFinished,
}: {
  canRun: boolean;
  onConsumeUse: () => void;
  onFinished: () => void;
}) {
  const toast = useToast();
  const [status, setStatus] = useState<Status>("idle");
  const [current, setCurrent] = useState(0);
  const [forceError, setForceError] = useState(false); // hidden dev toggle

  // Advance the mocked pipeline one step at a time.
  useEffect(() => {
    if (status !== "running") return;
    const t = setTimeout(() => {
      if (current < STEPS.length - 1) {
        setCurrent((c) => c + 1);
      } else if (forceError) {
        setStatus("error");
      } else {
        setStatus("done");
        onFinished();
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [status, current, forceError, onFinished]);

  function run() {
    // TODO: connect to backend — do not implement (send resume + JD to the AI service)
    setCurrent(0);
    setStatus("running");
    onConsumeUse();
  }

  return (
    <section className="animate-fade-up">
      <SectionTitle step="03" title="Run Optimization" />

      <GlassCard className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button onClick={run} disabled={!canRun || status === "running"}>
            {status === "running" ? "Optimizing…" : "Run ATS Optimization!"}
          </Button>
          {/* Hidden dev toggle so the error card can be previewed */}
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={forceError}
              onChange={(e) => setForceError(e.target.checked)}
            />
            Simulate failure (dev)
          </label>
        </div>

        {!canRun && status === "idle" ? (
          <p className="text-xs text-muted-foreground">
            Add a job description and upload a resume to enable optimization.
          </p>
        ) : null}

        {status === "running" ? (
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">
                  {i < current ? (
                    <CheckIcon className="text-foreground" />
                  ) : i === current ? (
                    <Spinner />
                  ) : (
                    <span className="block h-4 w-4 border-2 border-border" />
                  )}
                </span>
                <span className={i <= current ? "text-foreground" : "text-muted-foreground"}>
                  {step}
                </span>
              </div>
            ))}
            <Skeleton className="h-10 w-full" />
          </div>
        ) : null}

        {status === "done" ? (
          <div className="animate-fade-up plate p-8 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border-2 border-border-strong bg-signal text-signal-foreground">
              <CheckIcon className="h-6 w-6 text-foreground" />
            </span>
            <p className="font-display text-3xl uppercase leading-none">
              ATS Optimized resume is ready. Ace the interview!
            </p>
            <Button
              className="mt-5 shadow-xl"
              // TODO: connect to backend — do not implement (stream the generated DOCX)
              onClick={() => toast("Download started")}
            >
              Download Optimized Resume
            </Button>
          </div>
        ) : null}

        {status === "error" ? (
          <AlertCard
            title="Optimization failed"
            description="We couldn't finish processing your resume. Your free use has been restored — please try again in a moment."
          />
        ) : null}
      </GlassCard>
    </section>
  );
}
