import { useRef, useState } from "react";

import { Button, GlassCard, Label, SectionTitle, Textarea } from "./ui";

/**
 * UPLOAD & OPTIMIZE — the file is kept in local state only.
 * Nothing is parsed, read or uploaded anywhere.
 */
export function UploadOptimize({
  jobDescription,
  onJobDescription,
  fileName,
  onFile,
}: {
  jobDescription: string;
  onJobDescription: (value: string) => void;
  fileName: string | null;
  onFile: (name: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <section id="upload" className="animate-fade-up scroll-mt-32">
      <SectionTitle
        step="01"
        title="Upload & Optimize"
        subtitle="Paste the job description and drop in your current resume."
      />

      <GlassCard className="space-y-5">
        <div>
          <Label>Target Job Description</Label>
          <Textarea
            rows={7}
            value={jobDescription}
            placeholder="Paste the full job description here…"
            onChange={(e) => onJobDescription(e.target.value)}
          />
        </div>

        <div>
          <Label>Resume (PDF or DOCX)</Label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) onFile(file.name); // client-side only — no parsing
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-12 text-center transition-all duration-150 ${
              dragging
                ? "border-signal bg-signal/10"
                : "border-border hover:border-border-strong hover:bg-accent/20"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0]?.name ?? null)}
            />
            <p className="font-display text-2xl uppercase leading-none">
              {fileName ?? "Drag & drop your resume here"}
            </p>
            <p className="meta mt-2 text-muted-foreground">
              {fileName ? "Click to replace file" : "or click to browse — PDF / DOCX"}
            </p>
          </div>
          {fileName ? (
            <button
              onClick={() => onFile(null)}
              className="mt-2 text-xs text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-foreground hover:underline"
            >
              Remove file
            </button>
          ) : null}
        </div>

        <a href="#optional-links">
          <Button variant="secondary" size="sm">
            Add optional profile links ↓
          </Button>
        </a>
      </GlassCard>
    </section>
  );
}
