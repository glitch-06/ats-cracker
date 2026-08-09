import { useEffect, useRef, useState } from "react";

import { Badge, Button, Input, Label } from "./ui";

const MARQUEE = "BEAT THE BOT · RANK FIRST · GET THE CALL · ";

/**
 * AUTH SCREEN — split-screen console door.
 * Left: oversized editorial statement. Right: the access panel.
 * Email + OTP are entirely mocked; no email is sent and no code is verified.
 */
export function AuthScreen({ onLogin }: { onLogin: (email: string) => void }) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // 60s "resend OTP" cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    timer.current = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [countdown]);

  function sendOtp() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setBusy(true);
    // TODO: connect to backend — do not implement (send OTP email)
    setTimeout(() => {
      setBusy(false);
      setStep("otp");
      setCountdown(60);
    }, 1000);
  }

  function verifyOtp() {
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError("");
    setBusy(true);
    // TODO: connect to backend — do not implement (verify OTP, create session)
    setTimeout(() => {
      setBusy(false);
      onLogin(email);
    }, 900);
  }

  return (
    <main className="gridfield grid min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* Statement panel */}
      <section className="relative flex min-w-0 flex-col justify-between overflow-hidden border-b-2 border-border-strong px-6 py-10 lg:border-b-0 lg:border-r-2 lg:px-14 lg:py-14">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center border-2 border-border-strong bg-signal font-display text-lg text-signal-foreground">
            A
          </span>
          <span className="font-display text-2xl uppercase leading-none tracking-wide">
            ATS Cracker
          </span>
        </div>

        <div className="animate-fade-up my-12 lg:my-0">
          <p className="meta text-muted-foreground">AI resume optimization / console access</p>
          <h1 className="mt-4 font-display text-6xl uppercase leading-[0.85] tracking-tight sm:text-8xl">
            Your resume
            <br />
            <span className="text-signal">never met</span>
            <br />
            a human.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            75% of resumes are filtered by an applicant tracking system before anyone reads them.
            Feed the machine what it wants — then let the humans be impressed.
          </p>

          <dl className="mt-10 grid max-w-md grid-cols-3 border-2 border-border-strong">
            {[
              ["01", "Parse JD"],
              ["02", "Rewrite"],
              ["03", "Export"],
            ].map(([n, l]) => (
              <div key={n} className="border-r-2 border-border-strong p-4 last:border-r-0">
                <dt className="font-display text-3xl leading-none text-signal">{n}</dt>
                <dd className="meta mt-1 text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="overflow-hidden border-2 border-border-strong bg-signal text-signal-foreground">
          <div className="animate-marquee flex w-max whitespace-nowrap py-1 font-mono text-[0.65rem] tracking-[0.24em]">
            <span>{MARQUEE.repeat(8)}</span>
            <span>{MARQUEE.repeat(8)}</span>
          </div>
        </div>
      </section>

      {/* Access panel */}
      <section className="flex min-w-0 items-center justify-center px-6 py-12 lg:px-10">
        <div className="animate-fade-up w-full max-w-sm">
          <div className="mb-4 flex items-center justify-between">
            <Badge>{step === "email" ? "Step 01 / Identify" : "Step 02 / Verify"}</Badge>
            <span className="meta text-muted-foreground">Secure</span>
          </div>

          <div className="plate p-6">
            {step === "email" ? (
              <div key="email" className="animate-fade-up space-y-4">
                <h2 className="font-display text-3xl uppercase leading-none">Request access</h2>
                <div>
                  <Label>Email address</Label>
                  <Input
                    type="email"
                    value={email}
                    autoComplete="email"
                    placeholder="you@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                  />
                </div>
                {error ? <p className="meta text-destructive">{error}</p> : null}
                <Button className="w-full" onClick={sendOtp} disabled={busy}>
                  {busy ? "Sending OTP…" : "Send OTP →"}
                </Button>
              </div>
            ) : (
              <div key="otp" className="animate-fade-up space-y-4">
                <h2 className="font-display text-3xl uppercase leading-none">Enter code</h2>
                <div>
                  <Label>6-digit code sent to {email}</Label>
                  <Input
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    placeholder="000000"
                    className="text-center font-mono text-2xl tracking-[0.5em]"
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                  />
                </div>
                {error ? <p className="meta text-destructive">{error}</p> : null}
                <Button className="w-full" onClick={verifyOtp} disabled={busy}>
                  {busy ? "Verifying…" : "Verify & Login"}
                </Button>
                <div className="flex items-center justify-between gap-2 border-t-2 border-border pt-3">
                  <Button
                    variant="tertiary"
                    size="sm"
                    disabled={countdown > 0}
                    onClick={() => setCountdown(60)} // TODO: connect to backend — do not implement
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setStep("email");
                      setOtp("");
                      setError("");
                    }}
                  >
                    Change email
                  </Button>
                </div>
              </div>
            )}
          </div>

          <p className="meta mt-5 text-muted-foreground">
            Prototype mode — any valid email + any 6-digit code signs you in.
          </p>
        </div>
      </section>
    </main>
  );
}
