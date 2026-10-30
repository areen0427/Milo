import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { WORDMARK_LETTERS, WORDMARK_TEXT, WORDMARK_VIEWBOX } from "./wordmark.generated.ts";

// Matches the fade-out duration in styles.css.
const LEAVE_MS = 500;
// While the intro waits for the button, the drawing replays on this interval.
const REPLAY_MS = 12000;

type WelcomeIntroProps = {
  onEnter: () => void;
};

// Shown on every launch. The outline of "Milo" is traced letter by letter, then filled.
// It stays until the user presses the button, which leaves time for background loading.
export default function WelcomeIntro({ onEnter }: WelcomeIntroProps) {
  const [leaving, setLeaving] = useState(false);
  // Changing the key remounts the drawing, which restarts its CSS animations.
  const [replay, setReplay] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const id = window.setInterval(() => setReplay((count) => count + 1), REPLAY_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const enter = () => {
    if (leaving) return;
    setLeaving(true);
    timer.current = window.setTimeout(onEnter, LEAVE_MS);
  };

  return (
    <div className={leaving ? "intro intro-leaving" : "intro"} data-tauri-drag-region>
      <svg key={replay} className="intro-svg" viewBox={WORDMARK_VIEWBOX} role="img" aria-label={WORDMARK_TEXT}>
        <defs>
          {/* Warm sheen at the top, deeper orange at the base, as on frosted glass. */}
          <linearGradient id="milo-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe2bf" />
            <stop offset="0.35" stopColor="#ffa052" />
            <stop offset="1" stopColor="#ff6a18" />
          </linearGradient>
          {/* A specular highlight from the upper left, a soft orange halo, and the glass fill. */}
          <filter id="milo-frost" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="soft" />
            <feSpecularLighting
              in="soft"
              surfaceScale="5"
              specularConstant="1.1"
              specularExponent="18"
              lightingColor="#fff3e6"
              result="spec"
            >
              <fePointLight x="-300" y="-500" z="700" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceAlpha" operator="in" result="specClip" />
            <feComposite in="SourceGraphic" in2="specClip" operator="arithmetic" k1="0" k2="1" k3="0.6" k4="0" result="lit" />
            <feGaussianBlur in="SourceAlpha" stdDeviation="14" result="haloBlur" />
            <feFlood floodColor="#ff8a2a" floodOpacity="0.45" result="orange" />
            <feComposite in="orange" in2="haloBlur" operator="in" result="halo" />
            <feMerge>
              <feMergeNode in="halo" />
              <feMergeNode in="lit" />
            </feMerge>
          </filter>
        </defs>
        {WORDMARK_LETTERS.map((letter, index) => (
          <g key={index} className="intro-letter" style={{ "--i": index } as CSSProperties}>
            <path className="intro-stroke" pathLength={1} d={letter.d} />
            <path className="intro-fill" d={letter.d} fill="url(#milo-glass)" filter="url(#milo-frost)" />
          </g>
        ))}
      </svg>
      <button type="button" className="intro-button" autoFocus onClick={enter} disabled={leaving}>
        Open Milo
      </button>
    </div>
  );
}
