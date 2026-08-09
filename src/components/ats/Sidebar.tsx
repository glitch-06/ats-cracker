import { useState } from "react";

import { useToast } from "./toast";
import { Button, Input, Label, Modal, Textarea } from "./ui";

/**
 * Left sidebar (glass panel). Collapses into a top drawer on mobile —
 * see AppShell for the mobile toggle.
 */
export function Sidebar({
  email,
  onLogout,
  className,
}: {
  email: string;
  onLogout: () => void;
  className?: string | undefined;
}) {
  const toast = useToast();
  const [supportOpen, setSupportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ticket, setTicket] = useState({ title: "", description: "" });

  function submitTicket() {
    // TODO: connect to backend — do not implement (create support ticket)
    setSupportOpen(false);
    setTicket({ title: "", description: "" });
    toast("Support ticket submitted");
  }

  return (
    <aside className={className}>
      <div className="slab flex flex-col gap-5 p-5">
        <div>
          <p className="meta text-muted-foreground">
            Signed in as
          </p>
          <p className="mt-1 break-all font-mono text-sm text-signal">{email}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={onLogout}>
            Logout
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete Account
          </Button>
        </div>

        <Button variant="secondary" size="sm" onClick={() => setSupportOpen(true)}>
          Raise Support Ticket
        </Button>

        <div className="border-t-2 border-border pt-4 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
          Prototype build — all actions are simulated locally.
        </div>
      </div>

      <Modal open={supportOpen} onClose={() => setSupportOpen(false)} title="Raise Support Ticket">
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={ticket.title}
              placeholder="Short summary"
              onChange={(e) => setTicket({ ...ticket, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={4}
              value={ticket.description}
              placeholder="Tell us what went wrong…"
              onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="tertiary" onClick={() => setSupportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitTicket}>Submit</Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete account?">
        <p className="text-sm text-muted-foreground">
          This would permanently remove your account and history. In this prototype nothing is
          deleted.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="tertiary" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              // TODO: connect to backend — do not implement (delete account)
              setDeleteOpen(false);
              toast("Account deletion simulated");
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </aside>
  );
}
