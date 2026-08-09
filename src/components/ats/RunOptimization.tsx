import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { downloadOptimizedResume } from "@/lib/generateDocx";
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

export function RunOptimization({
  canRun,
  jobDescription,
  resumeText,
  links,
  onConsumeUse,
  onFinished,
}: {
  canRun: boolean;
  jobDescription: string;
  resumeText: string;
  links?: Record<string, unknown>;
  onConsumeUse: () => void;
  onFinished: () => void;
}) {
  const toast = useToast();
  const [status, setStatus] = useState<Status>("idle");
  const [current, setCurrent] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<any>(null);

  // Purely cosmetic step animation while the real request is in flight.
  useEffect(() => {
    if (status !== "running") return;
    const t = setTimeout(() => {
      if (current < STEPS.length - 1) {
        setCurrent((c) => c + 1);
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [status, current]);

  async function run() {
    setCurrent(0);
    setStatus("running");
    setErrorMessage("");
    onConsumeUse();

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        throw new Error("You're not logged in. Please log in again.");
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ jobDescription, resumeText, links: links ?? {} }),
        },
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Something went wrong while optimizing.");
      }

      setResult(json.optimization.optimized_resume);
      setStatus("done");
      onFinished();
    } catch (err: any) {
      setErrorMessage(err.message ?? "Optimization failed.");
      setStatus("error");
    }
  }

  return (
    <section className="animate-fade-up">
      <SectionTitle step="03" title="Run Optimization" />

      <GlassCard className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button onClick={run} disabled={!canRun || status === "running"}>
            {status === "running" ? "Optimizing…" : "Run ATS Optimization!"}
          </Button>
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

        {status === "done" && result ? (
          <div className="animate-fade-up plate p-8 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border-2 border-border-strong bg-signal text-signal-foreground">
              <CheckIcon className="h-6 w-6 text-foreground" />
            </span>
            <p className="font-display text-3xl uppercase leading-none">
              ATS Optimized resume is ready. Ace the interview!
            </p>
            {typeof result.ats_score === "number" ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Estimated match score: <strong>{result.ats_score}/100</strong>
              </p>
            ) : null}
            <Button
              className="mt-5 shadow-xl"
              onClick={async () => {
                await downloadOptimizedResume(result, result.name ?? "Your Name");
                toast("Download started");
              }}
            >
              Download Optimized Resume
            </Button>
          </div>
        ) : null}

        {status === "error" ? (
          <AlertCard
            title="Optimization failed"
            description={
              errorMessage ||
              "We couldn't finish processing your resume. Your free use has been restored — please try again in a moment."
            }
          />
        ) : null}
      </GlassCard>
    </section>
  );
}