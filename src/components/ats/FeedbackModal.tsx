import { useState } from "react";

import { useToast } from "./toast";
import { Button, Modal, Textarea } from "./ui";

/** FEEDBACK MODAL — mock submit only. */
export function FeedbackModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [rating, setRating] = useState<"good" | "bad" | null>(null);
  const [comment, setComment] = useState("");

  function submit() {
    // TODO: connect to backend — do not implement (store feedback)
    onClose();
    setRating(null);
    setComment("");
    toast("Feedback noted! Thanks!");
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
          <Button onClick={submit} disabled={!rating}>
            Submit Feedback
          </Button>
        </div>
      </div>
    </Modal>
  );
}
