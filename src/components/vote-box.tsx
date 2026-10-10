import { useEffect, useState } from "react";
import { Check, LoaderCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitVote, VOTER_KEY, SUBMITTED_KEY } from "@/lib/votes";
import type { Ranking } from "@/lib/ranking";

function getVoterId() {
  let id = localStorage.getItem(VOTER_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VOTER_KEY, id);
  }
  return id;
}

export function VoteBox({ ranking }: { ranking: Ranking }) {
  const key = JSON.stringify(ranking);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    try {
      setStatus(localStorage.getItem(SUBMITTED_KEY) === key ? "done" : "idle");
    } catch {
      setStatus("idle");
    }
  }, [key]);

  const send = async () => {
    setStatus("sending");
    try {
      await submitVote({ data: { voterId: getVoterId(), ranking: ranking as string[] } });
      try {
        localStorage.setItem(SUBMITTED_KEY, key);
      } catch {
        /* ignore */
      }
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto mt-6 flex max-w-[768px] flex-col items-center gap-3 px-4 text-center">
      {status === "done" ? (
        <p className="flex items-center gap-2 text-sm font-bold text-[var(--cyan)]">
          <Check size={16} /> Your vote is counted!
        </p>
      ) : (
        <Button className="action-primary" onClick={send} disabled={status === "sending"}>
          {status === "sending" ? <LoaderCircle className="animate-spin" /> : <Send />}
          {status === "sending" ? "Sending…" : "Submit my vote"}
        </Button>
      )}
      {status === "error" && (
        <p className="text-sm text-[var(--primary)]" role="alert">
          Couldn't send your vote. Please try again.
        </p>
      )}
      <a className="text-sm text-[var(--muted-foreground)] underline underline-offset-4" href="/results">
        See the results table
      </a>
    </div>
  );
}
