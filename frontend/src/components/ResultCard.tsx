import { PredictionResult } from "@/lib/api";
import { cn } from "@/lib/utils";
import charScientist from "@/assets/char-scientist.png";
import charShrug from "@/assets/char-shrug.png";

interface ResultCardProps {
  result: PredictionResult;
  title?: string;
  highlightDiff?: Set<string>;
  compact?: boolean;
}

/* ───────────────── dimension metadata ───────────────── */

type DimKey = "IE" | "NS" | "TF" | "JP";

const DIM_META: Record<DimKey, {
  left: string;       // letter on the left side of the slider
  right: string;      // letter on the right side
  leftWord: string;
  rightWord: string;
  question: string;   // friendly framing
}> = {
  IE: { left: "I", right: "E", leftWord: "Introvert", rightWord: "Extravert",
        question: "where you draw your energy" },
  NS: { left: "N", right: "S", leftWord: "Intuitive", rightWord: "Sensing",
        question: "how you take in the world" },
  TF: { left: "T", right: "F", leftWord: "Thinking", rightWord: "Feeling",
        question: "how you make decisions" },
  JP: { left: "J", right: "P", leftWord: "Judging", rightWord: "Perceiving",
        question: "how you organise life" },
};

function friendlyCertainty(pct: number) {
  if (pct >= 75) return { tag: "pretty confident", glyph: "✓✓", tone: "high" };
  if (pct >= 55) return { tag: "leaning this way",  glyph: "≈",  tone: "mid" };
  return                { tag: "could go either way", glyph: "?", tone: "low" };
}

function overallVerdict(pct: number) {
  if (pct >= 75) return "The model feels good about this read.";
  if (pct >= 55) return "A reasonable guess — but read it loosely.";
  return "Honestly? Your words point in several directions.";
}

/* ───────────────── hand-drawn semicircular gauge ───────────────── */

const CertaintyDial = ({ pct, delay = 0.3 }: { pct: number; delay?: number }) => {
  const r = 70;
  const cx = 90, cy = 86;
  // angle: 180° (left) to 0° (right) — pct 0..100 maps to 180..0
  const angleDeg = 180 - (pct / 100) * 180;
  const rad = (angleDeg * Math.PI) / 180;
  const needleX = cx + Math.cos(rad) * (r - 10);
  const needleY = cy - Math.sin(rad) * (r - 10);

  // arc path
  const arcStart = `${cx - r},${cy}`;
  const arcEnd = `${cx + r},${cy}`;

  return (
    <svg viewBox="0 0 180 110" className="w-full max-w-[220px] h-auto" aria-hidden>
      <defs>
        <pattern id="dial-hatch" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="hsl(var(--ink))" strokeWidth="1.4" />
        </pattern>
      </defs>

      {/* hatched fill of the certainty arc — wedge from left up to needle */}
      <path
        d={`M ${cx} ${cy} L ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${needleX} ${needleY} Z`}
        fill="url(#dial-hatch)"
        opacity="0.85"
        style={{ animation: `ink-bleed 1.1s cubic-bezier(0.22,1,0.36,1) ${delay}s both` }}
      />

      {/* outer arc — wobbly hand-drawn */}
      <path
        d={`M ${arcStart} A ${r} ${r} 0 0 1 ${arcEnd}`}
        fill="none"
        stroke="hsl(var(--ink))"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* tick marks every 25% */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const a = Math.PI - t * Math.PI;
        const x1 = cx + Math.cos(a) * r;
        const y1 = cy - Math.sin(a) * r;
        const x2 = cx + Math.cos(a) * (r + 6);
        const y2 = cy - Math.sin(a) * (r + 6);
        return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--ink))" strokeWidth="1.3" />;
      })}

      {/* labels */}
      <text x={cx - r - 2} y={cy + 14} className="font-mono-zine" fontSize="8" fill="hsl(var(--ink))" opacity="0.7" textAnchor="middle">unsure</text>
      <text x={cx} y={cy - r - 6} className="font-mono-zine" fontSize="8" fill="hsl(var(--ink))" opacity="0.7" textAnchor="middle">maybe</text>
      <text x={cx + r + 2} y={cy + 14} className="font-mono-zine" fontSize="8" fill="hsl(var(--ink))" opacity="0.7" textAnchor="middle">sure</text>

      {/* needle (animated rotation) */}
      <g
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: `needle-swing 1.4s cubic-bezier(0.34, 1.4, 0.64, 1) ${delay + 0.15}s both`,
          ['--needle-angle' as string]: `${-(90 - angleDeg)}deg`,
        }}
      >
        <line x1={cx} y1={cy} x2={cx} y2={cy - (r - 10)} stroke="hsl(var(--ink))" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill="hsl(var(--ink))" />
        <circle cx={cx} cy={cy} r="2" fill="hsl(var(--paper))" />
      </g>
    </svg>
  );
};

/* ───────────────── slider showing where on the spectrum ───────────────── */

const SpectrumSlider = ({
  leftLetter, rightLetter, leftWord, rightWord, label, confidence, delay,
}: {
  leftLetter: string; rightLetter: string;
  leftWord: string; rightWord: string;
  label: string;          // which side won — should match leftWord OR rightWord
  confidence: number;     // 0..1
  delay: number;
}) => {
  const leansLeft = label === leftWord;
  // position = how far from the centre toward the chosen side
  // confidence 0.5 = dead centre; confidence 1.0 = full extreme
  const offset = (confidence - 0.5) * 2; // 0..1
  const pos = leansLeft ? 50 - offset * 48 : 50 + offset * 48;

  return (
    <div className="w-full">
      <div className="relative h-9">
        {/* baseline track */}
        <svg viewBox="0 0 300 36" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <path d="M8 18 Q 150 14 292 18" stroke="hsl(var(--ink))" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* centre tick */}
          <line x1="150" y1="10" x2="150" y2="26" stroke="hsl(var(--ink))" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
          {/* end caps */}
          <line x1="8" y1="10" x2="8" y2="26" stroke="hsl(var(--ink))" strokeWidth="1.4" />
          <line x1="292" y1="10" x2="292" y2="26" stroke="hsl(var(--ink))" strokeWidth="1.4" />
        </svg>

        {/* marker — hand-drawn ring */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{
            left: `${pos}%`,
            animation: `slide-in-marker 1s cubic-bezier(0.34, 1.4, 0.64, 1) ${delay}s both`,
          }}
        >
          <svg viewBox="0 0 28 28" className="w-7 h-7">
            <circle cx="14" cy="14" r="11" fill="hsl(var(--paper))" stroke="hsl(var(--ink))" strokeWidth="2" />
            <circle cx="14" cy="14" r="4"  fill="hsl(var(--ink))" />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className={cn(
          "font-serif-zine text-base font-bold",
          leansLeft ? "text-foreground" : "text-foreground/40"
        )}>
          <span className="font-mono-zine text-xs mr-1 opacity-60">{leftLetter}</span>{leftWord}
        </div>
        <div className="font-hand text-lg text-foreground/60">↔</div>
        <div className={cn(
          "font-serif-zine text-base font-bold text-right",
          !leansLeft ? "text-foreground" : "text-foreground/40"
        )}>
          {rightWord}<span className="font-mono-zine text-xs ml-1 opacity-60">{rightLetter}</span>
        </div>
      </div>
    </div>
  );
};

/* ───────────────── corner crosshair ───────────────── */

const CornerMark = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" className={cn("w-5 h-5 text-foreground/70", className)} aria-hidden>
    <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1" />
    <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1" />
    <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);

/* ───────────────── main card ───────────────── */

export const ResultCard = ({ result, title, highlightDiff, compact }: ResultCardProps) => {
  const overall = Math.round(result.overall_confidence * 100);
  const verdict = friendlyCertainty(overall);
  const isUncertain = verdict.tone === "low";
  const fileNo = String(Math.floor(Math.random() * 8999) + 1000);

  return (
    <article
      key={result.final_type + result.model_used + fileNo}
      className="relative ink-blot"
      style={{ animationDelay: "0s" }}
    >
      <div className="paper-card relative bg-paper">
        <CornerMark className="absolute -top-2 -left-2" />
        <CornerMark className="absolute -top-2 -right-2" />
        <CornerMark className="absolute -bottom-2 -left-2" />
        <CornerMark className="absolute -bottom-2 -right-2" />

        {/* ── INDEX TAB ─────────────────────────────── */}
        <div className="flex items-stretch border-b-2 border-foreground">
          <div className="px-4 py-2 border-r-2 border-foreground bg-foreground text-paper font-mono-zine text-[10px] uppercase tracking-[0.28em] flex items-center">
            Reading
          </div>
          <div className="flex-1 px-4 py-2 font-mono-zine text-[10px] uppercase tracking-[0.28em] text-foreground/70 flex items-center justify-between">
            <span>{title || "your words, decoded"}</span>
            <span className="hidden sm:inline">№ {fileNo} · {result.model_used}</span>
          </div>
          <div
            className={cn(
              "px-3 ink-stamp font-mono-zine text-[10px] uppercase tracking-[0.28em] border-l-2 border-foreground bg-paper flex items-center",
              isUncertain ? "" : ""
            )}
            style={{ animationDelay: "0.15s" }}
          >
            {isUncertain ? "⚠ take w/ salt" : "✓ likely you"}
          </div>
        </div>

        {/* ── HERO ROW: type plaque + dial ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1fr]">
          {/* LEFT: big type stamp */}
          <div className="p-7 sm:p-10 border-b-2 lg:border-b-0 lg:border-r-2 border-foreground/80 border-dashed relative overflow-hidden">
            <div className="font-mono-zine text-[10px] uppercase tracking-[0.28em] text-foreground/60 mb-3">
              ▸ your type, probably
            </div>

            {/* Stamped type — circle around all 4 letters */}
            <div className="relative inline-block">
              <div className="flex items-end leading-none relative z-10">
                {result.final_type.split("").map((ch, i) => (
                  <span
                    key={i}
                    className="font-serif-zine font-bold ink-blot inline-block px-0.5"
                    style={{
                      fontSize: compact ? "5rem" : "7rem",
                      animationDelay: `${0.2 + i * 0.12}s`,
                      transform: `rotate(${[-2, 1.5, -1, 2][i % 4]}deg)`,
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </div>
              {/* hand-drawn circle around the type */}
              <svg
                viewBox="0 0 300 120"
                className="absolute -inset-3 w-[calc(100%+1.5rem)] h-[calc(100%+1.5rem)] pointer-events-none"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M40 20 Q 10 60 40 100 Q 150 118 260 100 Q 290 60 260 20 Q 150 4 40 20"
                  stroke="hsl(var(--ink))"
                  strokeWidth="2.2"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="800"
                  strokeDashoffset="800"
                  style={{ animation: `draw 1s cubic-bezier(0.65,0,0.35,1) 0.9s forwards` }}
                />
              </svg>
            </div>

            <p
              className="font-hand text-2xl text-foreground/80 mt-6 -rotate-1 ink-reveal max-w-md"
              style={{ animationDelay: "0.7s" }}
            >
              "{overallVerdict(overall)}"
            </p>

            {/* lexical evidence */}
            <div className="mt-6">
              <div className="font-mono-zine text-[10px] uppercase tracking-[0.28em] text-foreground/60 mb-3 flex items-center gap-2">
                <span className="h-px w-8 bg-foreground" />
                words that gave you away
              </div>
              <div className="flex flex-wrap gap-2">
                {result.top_words.map((w, i) => (
                  <span
                    key={w}
                    className="font-hand text-2xl px-3 py-0.5 border-2 border-foreground bg-paper ink-blot hover:bg-foreground hover:text-paper transition-colors cursor-default"
                    style={{
                      animationDelay: `${0.85 + i * 0.08}s`,
                      transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`,
                    }}
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: certainty dial + character */}
          <div className="p-6 flex flex-col items-center justify-center gap-3 bg-paper-deep/40 relative">
            <div className="font-mono-zine text-[10px] uppercase tracking-[0.28em] text-foreground/60">
              ▸ how sure is the model?
            </div>

            <CertaintyDial pct={overall} delay={0.35} />

            <div className="text-center -mt-2">
              <div
                className="font-serif-zine font-bold leading-none ink-blot"
                style={{ fontSize: "3rem", animationDelay: "0.55s" }}
              >
                {overall}<span className="text-2xl text-foreground/50">%</span>
              </div>
              <div
                className="font-hand text-xl text-foreground/80 mt-1 ink-reveal"
                style={{ animationDelay: "0.85s" }}
              >
                {verdict.glyph} {verdict.tag}
              </div>
            </div>

            <img
              src={isUncertain ? charShrug : charScientist}
              alt={isUncertain ? "uncertain" : "scientist"}
              width={120}
              height={140}
              className="w-24 h-auto animate-bob ink-blot"
              loading="lazy"
              style={{ animationDelay: "0.5s" }}
            />
          </div>
        </div>

        {/* ── DIMENSIONS ───────────────────────────── */}
        <div className="border-t-2 border-foreground">
          <div className="px-6 py-3 border-b-2 border-foreground bg-foreground text-paper font-mono-zine text-[10px] uppercase tracking-[0.28em] flex items-center justify-between">
            <span>▸ where you landed on each scale</span>
            <span className="opacity-70 hidden sm:inline">4 dimensions · slide to see lean</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            {(Object.keys(DIM_META) as DimKey[]).map((key, i) => {
              const d = result.dimensions[key];
              const meta = DIM_META[key];
              const isDiff = highlightDiff?.has(key);
              const pct = Math.round(d.confidence * 100);
              const cert = friendlyCertainty(pct);
              const delay = 0.35 + i * 0.18;

              return (
                <div
                  key={key}
                  className={cn(
                    "p-5 sm:p-6 flex flex-col gap-4 relative ink-blot border-foreground/80",
                    i < 2 ? "border-b-2" : "sm:border-b-0 border-b-2",
                    i === 2 ? "sm:border-b-0" : "",
                    i === 3 ? "border-b-0" : "",
                    i % 2 === 0 ? "sm:border-r-2" : "",
                    isDiff && "bg-foreground/5"
                  )}
                  style={{ animationDelay: `${delay}s` }}
                >
                  {isDiff && (
                    <div className="absolute -top-3 left-3 stamp bg-paper text-[8px] rotate-[-4deg]">
                      models disagree!
                    </div>
                  )}

                  {/* header — friendly question */}
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-hand text-xl text-foreground/70 -rotate-1">
                      {meta.question}
                    </div>
                    <div className="font-mono-zine text-[10px] tracking-[0.25em] text-foreground/40">
                      {meta.left}·{meta.right}
                    </div>
                  </div>

                  {/* spectrum slider */}
                  <SpectrumSlider
                    leftLetter={meta.left}
                    rightLetter={meta.right}
                    leftWord={meta.leftWord}
                    rightWord={meta.rightWord}
                    label={d.label}
                    confidence={d.confidence}
                    delay={delay + 0.2}
                  />

                  {/* certainty footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-dashed border-foreground/30">
                    <span className="font-mono-zine text-xl tabular-nums font-bold">
                      {pct}<span className="text-xs text-foreground/50">% sure</span>
                    </span>
                    <span
                      className={cn(
                        "font-hand text-lg ink-reveal",
                        cert.tone === "high" && "text-foreground",
                        cert.tone === "mid"  && "text-foreground/75",
                        cert.tone === "low"  && "text-foreground/55 italic",
                      )}
                      style={{ animationDelay: `${delay + 0.6}s` }}
                    >
                      {cert.glyph} {cert.tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FOOTER ───────────────────────────────── */}
        <div className="border-t-2 border-foreground px-6 py-3 flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono-zine uppercase tracking-[0.25em] text-foreground/60">
          <span>method: ƒ(words → traits)</span>
          <span className="hidden sm:inline">model: <span className="text-foreground font-semibold">{result.model_used}</span></span>
          <span className="font-hand text-base normal-case tracking-normal text-foreground/70">
            for curiosity, not diagnosis ✿
          </span>
        </div>
      </div>

      {result.warning && (
        <div
          className="mt-4 paper-card-soft p-4 font-hand text-xl ink-blot"
          style={{ animationDelay: "1.1s" }}
        >
          ⚠ {result.warning}
        </div>
      )}
    </article>
  );
};
