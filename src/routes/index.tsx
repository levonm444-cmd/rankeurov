import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Download, Heart, LoaderCircle, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { RankingPoster } from "@/components/ranking-poster";
import { COUNTRIES, emptyRanking, isComplete, nextEmpty, placeCountry, restoreRanking, STORAGE_KEY, type Country } from "@/lib/ranking";
import { HEARTS } from "@/lib/heart-assets";
import { VoteBox } from "@/components/vote-box";
const background = "/ranking-background.jpg";
const font = "/singing-sans.ttf";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "JESC 2026 My Ranking — Your Junior Eurovision Top 16" },
    { name: "description", content: "Rank your 16 Junior Eurovision 2026 countries and save your own colorful ranking poster." },
    { property: "og:title", content: "JESC 2026 My Ranking" },
    { property: "og:description", content: "Create your personal Junior Eurovision top 16 and export a shareable ranking poster." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "preload", href: font, as: "font", type: "font/ttf", crossOrigin: "anonymous" }] }),
  component: Index,
});

function Index() {
  const [ranking, setRanking] = useState(emptyRanking);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [storageError, setStorageError] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const exportBlob = useRef<Blob | null>(null);
  const count = ranking.filter(Boolean).length;
  const complete = isComplete(ranking);
  const remaining = COUNTRIES.filter((country) => !ranking.includes(country));

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const restored = restoreRanking(JSON.parse(stored));
        setRanking(restored);
        const firstEmpty = restored.indexOf(null);
        setActive(firstEmpty < 0 ? 0 : firstEmpty);
      }
    } catch { setStorageError(true); }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ranking)); }
    catch { setStorageError(true); }
    exportBlob.current = null;
  }, [ranking, ready]);

  const pick = (country: Country) => {
    const next = placeCountry(ranking, country, active);
    setRanking(next);
    setActive(nextEmpty(next, active));
  };
  const remove = (index: number) => {
    setRanking((current) => current.map((country, i) => i === index ? null : country));
    setActive(index);
  };

  const createPng = async () => {
    const node = posterRef.current;
    if (!node) throw new Error("Poster unavailable");
    await document.fonts.ready;
    await Promise.all(Array.from(node.querySelectorAll("img")).map((img) => img.decode()));
    const { toBlob } = await import("html-to-image");
    // Explicit font embedding avoids cross-origin stylesheet discovery on Safari.
    const fontResponse = await fetch(font);
    if (!fontResponse.ok) throw new Error("Font unavailable");
    const fontBlob = await fontResponse.blob();
    const fontData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(fontBlob);
    });
    const blob = await toBlob(node, {
      width: 768, height: 1030, pixelRatio: 1080 / 768,
      style: { transform: "none", transformOrigin: "top left" },
      fontEmbedCSS: `@font-face { font-family: 'Singing Sans'; src: url('${fontData}') format('truetype'); font-weight: 100 900; }`,
    });
    if (!blob) throw new Error("Image creation failed");
    exportBlob.current = blob;
    return blob;
  };

  // Prepare ahead of the tap so iOS file sharing retains its user gesture.
  useEffect(() => {
    if (!preview) return;
    let cancelled = false;
    setExporting(true); setExportError("");
    createPng().catch(() => { if (!cancelled) setExportError("Couldn't prepare your image. Tap Export PNG to try again."); })
      .finally(() => { if (!cancelled) setExporting(false); });
    return () => { cancelled = true; };
  }, [preview]);

  const exportPng = async () => {
    setExporting(true); setExportError("");
    try {
      const blob = exportBlob.current ?? await createPng();
      const file = new File([blob], "jesc-2026-my-ranking.png", { type: "image/png" });
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      if (ios && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a"); link.href = url; link.download = file.name; link.click();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) setExportError("Couldn't export your poster. Please try again.");
    } finally { setExporting(false); }
  };

  return <div className="app-shell">
    {!preview ? <>
      <header className="app-header">
        <img className="header-art" src={background} alt="" />
        <div className="header-inner">
          <div className="brand-line"><Heart className="brand-heart" /> Junior Eurovision 2026</div>
          <div className="header-main"><h1>My Ranking<span>.</span></h1><span className="year-tag">JESC 2026</span></div>
          <div className="progress-section">
            <div className="progress-label"><span>Your top 16</span><strong aria-live="polite">{count}/16</strong></div>
            <progress className="progress-track" value={count} max={16} aria-label="Ranking progress" />
          </div>
        </div>
      </header>
      <main className="editor-layout">
        <section aria-label="Ranking placements">
          <div className="section-heading"><h2>Your ranking</h2><span className="section-count">01 — 16</span></div>
          <div className="slots-list">
            {ranking.map((country, index) => <div className="slot" data-active={active === index} key={index}>
              <span className="slot-number">{index + 1}</span>
              <Button variant="slot" onClick={() => setActive(index)} aria-label={`Select placement ${index + 1}${country ? `, ${country}` : ""}`} aria-pressed={active === index}>
                {country ? <><img className="heart-flag" src={HEARTS[country]} alt="" /><span>{country}</span></> : <span className="slot-placeholder">{active === index ? "Your pick…" : "Add a country"}</span>}
              </Button>
              {country && <Button variant="ghost" className="remove-country" title={`Remove ${country}`} aria-label={`Remove ${country}`} onClick={() => remove(index)}><X /></Button>}
            </div>)}
          </div>
        </section>
        <section className="picker-section" aria-label="Country picker">
          <div className="section-heading"><h2>Pick for <span>#{active + 1}</span></h2><span className="section-count">{remaining.length} remaining</span></div>
          <div className="country-grid">
            {remaining.map((country) => <Button variant="country" key={country} onClick={() => pick(country)} aria-label={`Pick ${country}`}><img className="heart-flag" src={HEARTS[country]} alt="" /><span>{country}</span></Button>)}
          </div>
          {complete && <div className="picker-complete"><Check /><h3>All 16 ranked!</h3><p>Your poster is ready.</p><VoteBox ranking={ranking} /></div>}
        </section>
      </main>
    </> : <>
      <header className="preview-heading"><h1>Your ranking poster</h1><span className="complete-tag"><Check size={15} /> 16/16</span></header>
      <main><RankingPoster ranking={ranking} posterRef={posterRef} /><VoteBox ranking={ranking} />{exportError && <p className="export-error" role="alert">{exportError}</p>}</main>
    </>}
    {storageError && <p className="export-error" role="alert">Your browser couldn't save your progress. Keep this page open to retain your ranking.</p>}
    <footer className="asset-credit"><a href="/results">Results table</a> · Heart flags: <a href="https://commons.wikimedia.org/wiki/File:Eurovision_2026_white_heart_-_Georgia.svg" target="_blank" rel="noreferrer">Wikimedia Commons · EBU / ImStevan</a></footer>
    <div className="action-bar"><div className="action-inner">
      {preview ? <Button variant="ghost" onClick={() => { setPreview(false); setExportError(""); }}><ArrowLeft /> Edit</Button> : <Button variant="ghost" className="action-reset" onClick={() => setConfirmReset(true)} disabled={count === 0}><RotateCcw /> Reset</Button>}
      <span className="action-hint">{preview ? "Made by you. Ready to share." : "Your countries. Your order."}</span>
      {preview ? <Button className="action-primary" onClick={exportPng} disabled={exporting}>{exporting ? <LoaderCircle className="animate-spin" /> : <Download />}{exporting ? "Preparing PNG…" : "Export PNG"}</Button>
        : <Button className="action-primary" disabled={!complete} onClick={() => { if (complete) { setPreview(true); window.scrollTo({ top: 0 }); } }}>{complete ? <>See my ranking 🎉 <ArrowRight /></> : <>Rank {16 - count} more <ArrowRight /></>}</Button>}
    </div></div>
    <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}><AlertDialogContent className="reset-dialog">
      <AlertDialogHeader><AlertDialogTitle>Reset your ranking?</AlertDialogTitle><AlertDialogDescription>All 16 placements will be cleared. This can't be undone.</AlertDialogDescription></AlertDialogHeader>
      <AlertDialogFooter><AlertDialogCancel>Keep ranking</AlertDialogCancel><AlertDialogAction onClick={() => { setRanking(emptyRanking()); setActive(0); }}>Reset all</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent></AlertDialog>
  </div>;
}
