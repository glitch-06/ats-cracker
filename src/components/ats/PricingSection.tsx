import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { buyCreditPack } from "@/lib/razorpay";
import { useToast } from "./toast";
import { Badge, Button, GlassCard, SectionTitle } from "./ui";

type CreditPack = {
  id: string;
  name: string;
  credits: number;
  price_inr: number;
};

export function PricingSection({
  onCreditsAdded,
}: {
  onCreditsAdded?: (added: number) => void;
}) {
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loadingFor, setLoadingFor] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    supabase
      .from("credit_packs")
      .select("id, name, credits, price_inr")
      .eq("active", true)
      .order("price_inr", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setPacks(data);
      });
  }, []);

  function buy(pack: CreditPack) {
    setLoadingFor(pack.id);
    buyCreditPack(
      pack.id,
      (creditsAdded) => {
        setLoadingFor(null);
        toast(`Payment successful! ${creditsAdded} credits added.`);
        onCreditsAdded?.(creditsAdded);
      },
      (message) => {
        setLoadingFor(null);
        toast(message);
      },
    );
  }

  return (
    <section className="animate-fade-up">
      <Badge className="mb-4">Special Launch Offer</Badge>
      <SectionTitle
        step="03"
        title="Choose Your Optimization Plan"
        subtitle="One-time packs. No subscription, no auto-renewal."
      />

      {packs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading plans…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {packs.map((pack, i) => (
            <GlassCard key={pack.id} className={i === 1 ? "plate" : undefined}>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl uppercase leading-none">{pack.name}</h3>
                {i === 1 ? <Badge>Popular</Badge> : null}
              </div>

              <p className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-5xl leading-none text-signal">
                  ₹{pack.price_inr}
                </span>
              </p>
              <p className="meta mt-2 text-muted-foreground">{pack.credits} optimizations</p>

              <div className="mt-6">
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={loadingFor === pack.id}
                  onClick={() => buy(pack)}
                >
                  {loadingFor === pack.id ? "Opening checkout…" : `Buy ${pack.name}`}
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <p className="mt-4 border-t-2 border-border pt-3 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Pro Tip:</span> optimizations never expire
        — buy the bigger pack once and use it across every application.
      </p>
    </section>
  );
}