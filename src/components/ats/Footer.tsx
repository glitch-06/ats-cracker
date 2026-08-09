import { useState } from "react";

import { Modal } from "./ui";

const SUPPORT_EMAIL = "youremail@gmail.com"; // <-- replace with your real email

const CONTENT: Record<string, { title: string; body: string[] }> = {
  about: {
    title: "About Us",
    body: [
      "ATS Cracker rewrites your resume so applicant tracking systems actually see your experience.",
      "Built by a small team who got tired of qualified applications disappearing into parsing black holes.",
    ],
  },
  contact: {
    title: "Contact Us",
    body: [
      "Questions, bugs, or partnership ideas? Reach us directly by email — we usually reply within one business day.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "Placeholder copy. Your resume and job description would be processed only to produce your optimized document.",
      "Files would be deleted from temporary storage after processing completes.",
    ],
  },
};

export function Footer() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const active = openKey ? CONTENT[openKey] : null;

  return (
    <footer className="mt-16 border-t-2 border-border-strong pt-8 pb-12">
      <div className="flex flex-wrap items-center gap-6 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
        {Object.entries(CONTENT).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setOpenKey(key)}
            className="transition-colors duration-200 hover:text-foreground"
          >
            {item.title}
          </button>
        ))}
        
          <a href={`mailto:${SUPPORT_EMAIL}?subject=ATS Cracker Support`}
          className="transition-colors duration-200 hover:text-foreground"
        >
          Need Help? Email Support
        </a>
      </div>
      <div className="my-6 h-0.5 w-full bg-border" />
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
        ATS Cracker — built to get you past the filter. Prototype build.
      </p>

      <Modal open={!!active} onClose={() => setOpenKey(null)} title={active?.title ?? ""}>
        <div className="space-y-3 text-left text-sm text-muted-foreground">
          {active?.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {openKey === "contact" ? (
            
              <a href={`mailto:${SUPPORT_EMAIL}?subject=ATS Cracker Support`}
              className="inline-block font-medium text-foreground underline underline-offset-4"
            >
              {SUPPORT_EMAIL}
            </a>
          ) : null}
        </div>
      </Modal>
    </footer>
  );
}