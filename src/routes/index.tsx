import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/ats/AppShell";
import { AuthScreen } from "@/components/ats/AuthScreen";
import { useTheme } from "@/components/ats/theme";
import { ToastProvider } from "@/components/ats/toast";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return null; // or a spinner

  return (
    <ToastProvider>
      {email ? (
        <AppShell
          email={email}
          onLogout={async () => {
            await supabase.auth.signOut();
            setEmail(null);
          }}
          theme={theme}
          onToggleTheme={toggle}
        />
      ) : (
        <AuthScreen onLogin={setEmail} />
      )}
    </ToastProvider>
  );
}
