import { useState } from "react";

import { useToast } from "./toast";
import { Button, GlassCard, Input, Label, SectionTitle } from "./ui";

type LinkRow = { id: number; name: string; url: string };

let rowId = 0;
const newRow = (): LinkRow => ({ id: ++rowId, name: "", url: "" });

/** Collapsible accordion group. */
function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="slab overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors duration-200 hover:bg-accent/30"
      >
        <span className="font-display text-xl uppercase leading-none">{title}</span>
        <span className="font-mono text-signal">{open ? "[ − ]" : "[ + ]"}</span>
      </button>
      {open ? <div className="animate-fade-up space-y-4 px-5 pb-5">{children}</div> : null}
    </div>
  );
}

/** Dynamic add/remove rows of "name + url". */
function DynamicRows({
  rows,
  setRows,
  nameLabel,
  addLabel,
  note,
}: {
  rows: LinkRow[];
  setRows: (rows: LinkRow[]) => void;
  nameLabel: string;
  addLabel: string;
  note?: string;
}) {
  return (
    <div className="space-y-3">
      {note ? (
        <p className="border-l-4 border-signal bg-accent/40 px-3 py-2 text-xs text-muted-foreground">
          ⓘ {note}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nothing added yet.</p>
      ) : null}

      {rows.map((row) => (
        <div key={row.id} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
          <Input
            placeholder={nameLabel}
            value={row.name}
            onChange={(e) =>
              setRows(rows.map((r) => (r.id === row.id ? { ...r, name: e.target.value } : r)))
            }
          />
          <Input
            placeholder="https://…"
            value={row.url}
            onChange={(e) =>
              setRows(rows.map((r) => (r.id === row.id ? { ...r, url: e.target.value } : r)))
            }
          />
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setRows(rows.filter((r) => r.id !== row.id))}
          >
            Remove
          </Button>
        </div>
      ))}

      <Button variant="secondary" size="sm" onClick={() => setRows([...rows, newRow()])}>
        {addLabel}
      </Button>
    </div>
  );
}

/** OPTIONAL LINKS — all values stay in local state. */
export function OptionalLinks() {
  const toast = useToast();
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [profiles, setProfiles] = useState<LinkRow[]>([]);
  const [projects, setProjects] = useState<LinkRow[]>([]);
  const [certs, setCerts] = useState<LinkRow[]>([]);
  const [saved, setSaved] = useState(false);

  function save() {
    // TODO: connect to backend — do not implement (persist profile links)
    setSaved(true);
    toast("Profile links saved!");
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <section id="optional-links" className="animate-fade-up scroll-mt-32">
      <SectionTitle
        step="02"
        title="Optional Links"
        subtitle="Injected into the optimized resume so recruiters can click straight through."
      />

      <div className="space-y-3">
        <Accordion title="Base Profile Links" defaultOpen>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>LinkedIn</Label>
              <Input
                placeholder="https://linkedin.com/in/…"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>
            <div>
              <Label>GitHub</Label>
              <Input
                placeholder="https://github.com/…"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
            </div>
          </div>
        </Accordion>

        <Accordion title="Extra Profile Links">
          <DynamicRows
            rows={profiles}
            setRows={setProfiles}
            nameLabel="Platform name"
            addLabel="+ Add Profile Link"
          />
        </Accordion>

        <Accordion title="Project Links">
          <DynamicRows
            rows={projects}
            setRows={setProjects}
            nameLabel="Project match name"
            addLabel="+ Add Project Link"
            note="Type the exact project title as it appears in your resume."
          />
        </Accordion>

        <Accordion title="Certification Links">
          <DynamicRows
            rows={certs}
            setRows={setCerts}
            nameLabel="Certification match name"
            addLabel="+ Add Certification Link"
            note="Type the exact certification title as it appears in your resume."
          />
        </Accordion>
      </div>

      <GlassCard className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Links are stored locally in this prototype.
        </p>
        <div className="flex items-center gap-3">
          {saved ? <span className="text-xs text-foreground">Profile links saved!</span> : null}
          <Button onClick={save}>Save Profile Links</Button>
        </div>
      </GlassCard>
    </section>
  );
}
