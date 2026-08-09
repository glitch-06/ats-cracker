import { useEffect, useState } from "react";

import { FeedbackModal } from "./FeedbackModal";
import { Footer } from "./Footer";
import { OptionalLinks } from "./OptionalLinks";
import { PricingSection } from "./PricingSection";
import { RunOptimization } from "./RunOptimization";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./theme";
import { UploadOptimize } from "./UploadOptimize";
import { AlertCard, Badge, Button } from "./ui";
import { extractResumeText } from "@/lib/extractText";

const INDEX = [
  { id: "upload", num: "01", label: "Upload" },
  { id: "optional-links", num: "02", label: "Links" },
  { id: "plans", num: "03", label: "Plans" },
  { id: "run", num: "04", label: "Run" },
];

const TICKER =
  "ATS CRACKER  ·  KEYWORD REWRITE  ·  DOCX EXPORT  ·  LINK INJECTION  ·  BEAT THE BOT  ·  ";

export function AppShell({
  email,
  onLogout,
  theme,
  onToggleTheme,
}: {
  email: string;
  onLogout: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [active, setActive] = useState("upload");

  const [uses, setUses] = useState(10);
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [extracting, setExtracting] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) {
      setFileName(null);
      setResumeFile(null);
      setResumeText("");
      return;
    }
    setFileName(file.name);
    setResumeFile(file);
    setExtracting(true);
    try {
      const text = await extractResumeText(file);
      setResumeText(text);
    } catch (err) {
      console.error("Failed to read resume:", err);
      setResumeText("");
    } finally {
      setExtracting(false);
    }
  }

  useEffect(() => {
    const onScroll = () => {
      const hit = INDEX.map((s) => {
        const el = document.getElementById(s.id);
        return { id: s.id, top: el ? Math.abs(el.getBoundingClientRect().top - 120) : Infinity };
      }).sort((a, b) => a.top - b.top)[0];
      if (hit) setActive(hit.id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="gridfield min-h-screen">
      <header className="sticky top-0 z-40 border-b-2 border-border-strong bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setDrawerOpen((o) => !o)}
              className="lift shrink-0 border-2 border-border-strong px-2.5 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] lg:hidden"
            >
              {drawerOpen ? "Close" : "Menu"}
            </button>
            <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-border-strong bg-signal font-display text-base text-signal-foreground">
              A
            </span>
            <span className="truncate font-display text-2xl uppercase leading-none tracking-wide">
              ATS Cracker
            </span>
            <span className="meta hidden text-muted-foreground md:inline">/ console v1</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="meta hidden border-2 border-border-strong px-2 py-1 sm:inline">
              {uses} credits
            </span>
            <Button variant="tertiary" size="sm" onClick={() => setFeedbackOpen(true)}>
              Feedback
            </Button>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>

        <div className="overflow-hidden border-t-2 border-border-strong bg-signal text-signal-foreground">
          <div className="animate-marquee flex w-max whitespace-nowrap py-1 font-mono text-[0.65rem] tracking-[0.24em]">
            <span>{TICKER.repeat(6)}</span>
            <span>{TICKER.repeat(6)}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div
          className={`space-y-5 lg:sticky lg:top-32 lg:block lg:self-start ${
            drawerOpen ? "block" : "hidden"
          }`}
        >
          <nav className="slab p-4">
            <p className="meta mb-3 text-muted-foreground">Index</p>
            <ul className="space-y-1">
              {INDEX.map((s) => (
                <li key={s.id}>
                  
                    <a href={`#${s.id}`}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-baseline gap-3 border-l-4 px-3 py-2 transition-colors duration-150 ${
                      active === s.id
                        ? "border-l-signal bg-accent/50 text-foreground"
                        : "border-l-transparent text-muted-foreground hover:border-l-border-strong hover:text-foreground"
                    }`}
                  >
                    <span className="font-mono text-[0.65rem] tracking-widest">{s.num}</span>
                    <span className="font-display text-xl uppercase leading-none">{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <Sidebar email={email} onLogout={onLogout} />
        </div>

        <main className="min-w-0 space-y-10">
          {uses > 0 ? (
            <div className="plate animate-fade-up grid gap-4 p-6 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
              <span className="font-display text-6xl leading-none text-signal">{uses}</span>
              <div className="min-w-0">
                <Badge>Free tier</Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  free optimizations remaining on this account.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setShowPricing((s) => !s)}>
                {showPricing ? "Hide plans" : "Get more"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <AlertCard
                title="You've exhausted your free optimizations."
                description="Pick a pack below to keep optimizing your resume."
              />
              <Button variant="secondary" size="sm" onClick={() => setShowPricing(true)}>
                View plans
              </Button>
            </div>
          )}

          <UploadOptimize
            jobDescription={jobDescription}
            onJobDescription={setJobDescription}
            fileName={fileName}
            onFile={handleFile}
          />

          <OptionalLinks />

          <div id="plans" className="scroll-mt-32">
            {showPricing || uses === 0 ? <PricingSection /> : null}
          </div>

          <div id="run" className="scroll-mt-32">
            <RunOptimization
              canRun={
                jobDescription.trim().length > 0 &&
                !!resumeFile &&
                !extracting &&
                resumeText.trim().length > 0 &&
                uses > 0
              }
              jobDescription={jobDescription}
              resumeText={resumeText}
              onConsumeUse={() => setUses((u) => Math.max(0, u - 1))}
              onFinished={() => setFeedbackOpen(true)}
            />
          </div>

          <Footer />
        </main>
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}