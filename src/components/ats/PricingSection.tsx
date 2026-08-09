import { useState } from "react";

import { useToast } from "./toast";
import { Badge, Button, GlassCard, SectionTitle } from "./ui";

/** Hardcoded pricing data — no payment gateway is involved. */
const TIERS = [
  { id: "starter", name: "Starter", uses: 10, was: "₹499", now: "₹199", popular: false },
  { id: "value", name: "Value", uses: 40, was: "₹1,499", now: "₹599", popular: true },
  { id: "pro", name: "Pro", uses: 100, was: "₹2,999", now: "₹1,099", popular: false },
];

export function PricingSection() {
  // Which tier has a mock "Pay Now" link generated
  const [linkFor, setLinkFor] = useState<string | null>(null);
  const [loadingFor, setLoadingFor] = useState<string | null>(null);
  const toast = useToast();

  function buy(id: string) {
    setLoadingFor(id);
    // TODO: connect to backend — do not implement (create Razorpay order)
    setTimeout(() => {
      setLoadingFor(null);
      setLinkFor(id);
    }, 1100);
  }

  return (
    <section className="animate-fade-up">
      <Badge className="mb-4">Special Launch Offer — up to 63% off</Badge>
      <SectionTitle
        step="03"
        title="Choose Your Optimization Plan"
        subtitle="One-time packs. No subscription, no auto-renewal."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {TIERS.map((tier) => (
          <GlassCard
            key={tier.id}
            className={tier.popular ? "plate" : undefined}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl uppercase leading-none">{tier.name}</h3>
              {tier.popular ? <Badge>Popular</Badge> : null}
            </div>

            <p className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-5xl leading-none text-signal">{tier.now}</span>
              <span className="text-sm text-muted-foreground line-through">{tier.was}</span>
            </p>
            <p className="meta mt-2 text-muted-foreground">
              {tier.uses} optimizations
            </p>

            <div className="mt-6">
              {linkFor === tier.id ? (
                <Button
                  className="w-full"
                  onClick={() => toast("Payment link opened (simulated)")}
                >
                  Pay Now →
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={loadingFor === tier.id}
                  onClick={() => buy(tier.id)}
                >
                  {loadingFor === tier.id ? "Generating link…" : `Buy ${tier.name}`}
                </Button>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      <p className="mt-4 border-t-2 border-border pt-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Pro Tip:</span> optimizations never expire
        — buy the bigger pack once and use it across every application.
      </p>
    </section>
  );
}
