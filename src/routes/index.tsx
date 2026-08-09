import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/ats/AppShell";
import { AuthScreen } from "@/components/ats/AuthScreen";
import { useTheme } from "@/components/ats/theme";
import { ToastProvider } from "@/components/ats/toast";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ATS Cracker — AI Resume Optimizer" },
      {
        name: "description",
        content:
          "Optimize your resume for applicant tracking systems with AI-rewritten keywords, bullet points and injected profile links.",
      },
      { property: "og:title", content: "ATS Cracker — AI Resume Optimizer" },
      {
        property: "og:description",
        content: "Outsmart the ATS and land your dream job with an AI-optimized resume.",
      },
    ],
  }),
  component: Index,
});

/** Root screen: mocked auth gate in front of the app shell. */
function Index() {
  const { theme, toggle } = useTheme();
  // TODO: connect to backend — do not implement (real session state)
  const [email, setEmail] = useState<string | null>(null);

  return (
    <ToastProvider>
      {email ? (
        <AppShell
          email={email}
          onLogout={() => setEmail(null)}
          theme={theme}
          onToggleTheme={toggle}
        />
      ) : (
        <AuthScreen onLogin={setEmail} />
      )}
    </ToastProvider>
  );
}
