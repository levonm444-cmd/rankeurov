import { useEffect, useRef, type RefObject } from "react";
const background = "/ranking-background.jpg";
import { HEARTS } from "@/lib/heart-assets";
import type { Ranking } from "@/lib/ranking";

export function RankingPoster({ ranking, posterRef }: { ranking: Ranking; posterRef: RefObject<HTMLDivElement | null> }) {
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const resize = () => stage.style.setProperty("--poster-scale", String(stage.clientWidth / 768));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return <div className="poster-wrap"><div className="poster-stage" ref={stageRef}>
    <div className="ranking-poster" ref={posterRef} aria-label="Your Junior Eurovision 2026 ranking poster">
      <img className="poster-background" src={background} alt="" />
      <div className="poster-content">
        <h2 className="poster-title">My Ranking</h2>
        <p className="poster-subtitle">JESC 2026</p>
        <div className="poster-columns">
          {[0, 8].map((start) => <div className="poster-column" key={start}>
            {ranking.slice(start, start + 8).map((country, offset) => country && <div className="poster-row" key={country}>
              <span className="poster-position">{start + offset + 1}</span>
              <div className="poster-stripe">
                <img className="poster-heart" src={HEARTS[country]} alt={`${country} heart flag`} />
                <span className="poster-country">{country}</span>
              </div>
            </div>)}
          </div>)}
        </div>
      </div>
    </div>
  </div></div>;
}