import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, RefreshCw } from "lucide-react";
import { HEARTS } from "@/lib/heart-assets";
import type { Country } from "@/lib/ranking";
import { getResults } from "@/lib/votes";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "JESC 2026 — Results table" },
      { name: "description", content: "Combined Junior Eurovision 2026 results from all visitors, scored with Eurovision points." },
    ],
  }),
  component: Results,
});

type Data = Awaited<ReturnType<typeof getResults>>;
const medal = ["var(--gold)", "var(--silver)", "var(--bronze)"];

function Results() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      setData(await getResults());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="app-shell">
      <div className="mx-auto max-w-[828px] px-4 py-8">
        <div className="flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-white">
            <ArrowLeft size={16} /> My ranking
          </a>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-xs font-bold disabled:opacity-50"
          >
            {loading ? <LoaderCircle size={14} className="animate-spin" /> : <RefreshCw size={14} />} Refresh
          </button>
        </div>

        <h1 className="mt-6 text-4xl font-extrabold">
          Results<span className="text-[var(--primary)]">.</span>
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {data ? `${data.votes} ${data.votes === 1 ? "vote" : "votes"}` : "Loading…"} · 1st place = 12 points, 2nd = 10,
          3rd = 8, then 7 down to 1 for places 4–10.
        </p>

        {error && (
          <p className="mt-6 text-sm text-[var(--primary)]" role="alert">
            Couldn't load the results. Please try again.
          </p>
        )}

        {data && (
          <div className="mt-6 overflow-hidden rounded-md border border-[var(--border)]">
            <div className="grid grid-cols-[44px_1fr_64px_72px] gap-2 px-3 py-2 text-xs text-[var(--muted-foreground)]">
              <span>#</span>
              <span>Country</span>
              <span className="text-right">12s</span>
              <span className="text-right">Points</span>
            </div>
            {data.results.map((row, index) => (
              <div
                key={row.country}
                className="grid grid-cols-[44px_1fr_64px_72px] items-center gap-2 border-t border-[var(--border)] px-3 py-2"
              >
                <span className="text-sm font-bold" style={{ color: medal[index] ?? "var(--muted-foreground)" }}>
                  {index + 1}
                </span>
                <span className="flex items-center gap-3 text-sm font-bold">
                  <img className="heart-flag" src={HEARTS[row.country as Country]} alt="" />
                  {row.country}
                </span>
                <span className="text-right text-sm text-[var(--muted-foreground)]">{row.twelves}</span>
                <span className="text-right text-lg font-extrabold" style={{ color: medal[index] ?? "inherit" }}>
                  {row.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
