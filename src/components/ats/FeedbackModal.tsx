import { useState } from "react";

import { supabase } from "@/lib/supabase";
import { useToast } from "./toast";
import { Button, Modal, Textarea } from "./ui";

/** FEEDBACK MODAL — saves to Supabase. */
export function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [rating, setRating] = useState<"good" | "bad" | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("feedback").insert({
        user_id: user?.id ?? null,
        email: user?.email ?? null,
        type: "feedback",
        message: `Rating: ${rating}${comment ? ` | Comment: ${comment}` : ""}`,
      });

      if (error) throw error;

      toast("Feedback noted! Thanks!");
    } catch (err) {
      toast("Couldn't submit feedback — please try again.");
    } finally {
      setSubmitting(false);
      onClose();
      setRating(null);
      setComment("");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="How did the ATS Cracker perform?">
      <div className="space-y-4">
        <div className="flex gap-2">
          {(["good", "bad"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setRating(value)}
              className={`lift rounded-full px-5 py-2 text-sm font-medium capitalize ${
                rating === value
                  ? "bg-primary text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <Textarea
          rows={4}
          value={comment}
          placeholder="Anything you'd like to add? (optional)"
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="flex justify-end">
          <Button onClick={submit} disabled={!rating || submitting}>
            {submitting ? "Submitting…" : "Submit Feedback"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}