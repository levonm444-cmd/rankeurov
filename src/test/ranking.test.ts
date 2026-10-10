import { describe, expect, it } from "vitest";
import { COUNTRIES, emptyRanking, isComplete, nextEmpty, placeCountry, restoreRanking } from "@/lib/ranking";

describe("JESC ranking rules", () => {
  it("includes exactly the 16 participating countries", () => {
    expect([...COUNTRIES]).toEqual(["Albania", "Armenia", "Cyprus", "France", "Georgia", "Ireland", "Italy", "Malta", "Montenegro", "Netherlands", "North Macedonia", "Poland", "Portugal", "San Marino", "Spain", "Ukraine"]);
  });
  it("assigns a country to the active slot without duplicates", () => {
    const first = placeCountry(emptyRanking(), "Armenia", 0);
    const moved = placeCountry(first, "Armenia", 5);
    expect(moved[0]).toBeNull();
    expect(moved[5]).toBe("Armenia");
    expect(moved.filter(Boolean)).toHaveLength(1);
  });
  it("replacement returns the old country to the unplaced pool", () => {
    const ranking = placeCountry(placeCountry(emptyRanking(), "Spain", 0), "Georgia", 0);
    expect(ranking[0]).toBe("Georgia");
    expect(ranking.includes("Spain")).toBe(false);
  });
  it("advances to the next empty slot and wraps around", () => {
    const ranking = placeCountry(placeCountry(emptyRanking(), "Spain", 0), "France", 1);
    expect(nextEmpty(ranking, 0)).toBe(2);
    expect(nextEmpty(ranking, 15)).toBe(2);
  });
  it("unlocks the preview only for a full unique ranking of 16", () => {
    expect(isComplete([...COUNTRIES])).toBe(true);
    expect(isComplete([...COUNTRIES.slice(0, 15), null])).toBe(false);
    expect(isComplete([...COUNTRIES.slice(0, 15), "Spain"])).toBe(false);
  });
  it("restores saved progress and removes corrupt or duplicate countries", () => {
    const saved = emptyRanking(); saved[2] = "Italy";
    expect(restoreRanking(JSON.parse(JSON.stringify(saved)))[2]).toBe("Italy");
    expect(restoreRanking(["Italy"])).toEqual(emptyRanking());
    expect(restoreRanking(["Italy", "Italy", ...Array(14).fill(null)])[1]).toBeNull();
  });
});