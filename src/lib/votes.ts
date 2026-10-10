import { createServerFn } from "@tanstack/react-start";
import { COUNTRIES, type Country } from "./ranking";

// Eurovision-style points: 1st place = 12, 2nd = 10, 3rd = 8, then 7 down to 1. Places 11-16 get 0.
export const POINTS = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1] as const;
export const VOTER_KEY = "jesc-2026-voter-id";
export const SUBMITTED_KEY = "jesc-2026-submitted-ranking";

type Stmt = {
  bind: (...values: unknown[]) => Stmt;
  run: () => Promise<unknown>;
  all: <T>() => Promise<{ results: T[] }>;
};
type Db = { prepare: (sql: string) => Stmt };

async function getDb(): Promise<Db> {
  // @ts-ignore - provided by the Cloudflare Workers runtime
  const { env } = await import("cloudflare:workers");
  const db = (env as unknown as { DB?: Db }).DB;
  if (!db) throw new Error("Database is not connected");
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS votes (voter_id TEXT PRIMARY KEY, ranking TEXT NOT NULL, updated_at TEXT NOT NULL)",
    )
    .run();
  return db;
}

export const submitVote = createServerFn({ method: "POST" })
  .inputValidator((input: { voterId: string; ranking: string[] }) => {
    const { voterId, ranking } = input;
    if (typeof voterId !== "string" || voterId.length < 8 || voterId.length > 64) {
      throw new Error("Invalid voter");
    }
    const valid =
      Array.isArray(ranking) &&
      ranking.length === 16 &&
      ranking.every((c) => (COUNTRIES as readonly string[]).includes(c)) &&
      new Set(ranking).size === 16;
    if (!valid) throw new Error("Invalid ranking");
    return { voterId, ranking: ranking as Country[] };
  })
  .handler(async ({ data }) => {
    const db = await getDb();
    // One vote per browser: voting again replaces the previous vote.
    await db
      .prepare(
        "INSERT INTO votes (voter_id, ranking, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(voter_id) DO UPDATE SET ranking = excluded.ranking, updated_at = excluded.updated_at",
      )
      .bind(data.voterId, JSON.stringify(data.ranking), new Date().toISOString())
      .run();
    return { ok: true as const };
  });

export const getResults = createServerFn({ method: "GET" }).handler(async () => {
  const db = await getDb();
  const { results: rows } = await db.prepare("SELECT ranking FROM votes").all<{ ranking: string }>();
  const totals = new Map<string, { points: number; twelves: number }>(
    COUNTRIES.map((c) => [c, { points: 0, twelves: 0 }]),
  );
  let votes = 0;
  for (const row of rows) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(row.ranking);
    } catch {
      continue;
    }
    if (!Array.isArray(parsed)) continue;
    votes++;
    POINTS.forEach((points, index) => {
      const entry = totals.get(String(parsed[index]));
      if (!entry) return;
      entry.points += points;
      if (index === 0) entry.twelves++;
    });
  }
  const results = Array.from(totals, ([country, t]) => ({ country, points: t.points, twelves: t.twelves })).sort(
    (a, b) => b.points - a.points || b.twelves - a.twelves || a.country.localeCompare(b.country),
  );
  return { votes, results };
});
