export const COUNTRIES = ["Albania", "Armenia", "Cyprus", "France", "Georgia", "Ireland", "Italy", "Malta", "Montenegro", "Netherlands", "North Macedonia", "Poland", "Portugal", "San Marino", "Spain", "Ukraine"] as const;
export type Country = typeof COUNTRIES[number];
export type Ranking = (Country | null)[];
export const STORAGE_KEY = "jesc-2026-my-ranking";
export const emptyRanking = (): Ranking => Array.from({ length: 16 }, () => null);
export function restoreRanking(value: unknown): Ranking {
  if (!Array.isArray(value) || value.length !== 16) return emptyRanking();
  const seen = new Set<string>();
  return value.map((country) => {
    if (!COUNTRIES.includes(country) || seen.has(country)) return null;
    seen.add(country);
    return country as Country;
  });
}
export function placeCountry(ranking: Ranking, country: Country, index: number): Ranking {
  if (index < 0 || index >= 16) return ranking;
  const next = ranking.map((item) => item === country ? null : item);
  next[index] = country;
  return next;
}
export function nextEmpty(ranking: Ranking, after: number): number {
  for (let offset = 1; offset <= 16; offset++) {
    const index = (after + offset) % 16;
    if (ranking[index] === null) return index;
  }
  return after;
}
export const isComplete = (ranking: Ranking) => ranking.length === 16 && new Set(ranking).size === 16 && ranking.every((item) => item !== null);