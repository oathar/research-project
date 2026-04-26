import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResultCard } from "@/components/ResultCard";
import { compare, CompareResult, predict, PredictionResult } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, useScroll, useTransform } from "framer-motion";
import charTrio from "@/assets/char-trio.png";
import charWriter from "@/assets/char-writer.png";
import charScientist from "@/assets/char-scientist.png";
import charShrug from "@/assets/char-shrug.png";
import doodles from "@/assets/doodles.png";

/* ────────────────────────────────────────────────────────────
   MindPrint — "Field Notes on Words"
   A research zine. Black ink. Hand-drawn. Single page.
   ──────────────────────────────────────────────────────────── */

// Hand-drawn arrow SVG
const HandArrow = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 60" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 30 Q 30 5 60 30 T 92 25" />
    <path d="M85 18 L 92 25 L 84 32" />
  </svg>
);

// Big circled headline word
const Circled = ({ children }: { children: React.ReactNode }) => (
  <span className="ink-circle inline-block px-2">{children}</span>
);

// Section divider with text
const Divider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4 my-16">
    <div className="h-px flex-1 bg-foreground" />
    <span className="font-mono-zine text-[10px] uppercase tracking-[0.3em]">{label}</span>
    <div className="h-px flex-1 bg-foreground" />
  </div>
);

const Index = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState<null | "single" | "compare">(null);
  const [single, setSingle] = useState<PredictionResult | null>(null);
  const [comparison, setComparison] = useState<CompareResult | null>(null);

  const { scrollY } = useScroll();
  const heroRotate = useTransform(scrollY, [0, 800], [0, -8]);
  const heroY = useTransform(scrollY, [0, 600], [0, 120]);

  const wordCount = useMemo(
    () => (text.trim() ? text.trim().split(/\s+/).length : 0),
    [text]
  );
  const tooShort = wordCount > 0 && wordCount < 20;

  const handleAnalyze = async () => {
    if (!text.trim()) return toast.error("Write something first.");
    setLoading("single");
    setComparison(null);
    try {
      const res = await predict(text, "lr");
      setSingle(res);
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch { toast.error("Analysis failed."); }
    finally { setLoading(null); }
  };

  const handleCompare = async () => {
    if (!text.trim()) return toast.error("Write something first.");
    setLoading("compare");
    setSingle(null);
    try {
      const res = await compare(text);
      setComparison(res);
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } catch { toast.error("Comparison failed."); }
    finally { setLoading(null); }
  };

  const diffKeys = useMemo(() => {
    if (!comparison) return new Set<string>();
    const set = new Set<string>();
    (Object.keys(comparison.lr.dimensions) as Array<keyof typeof comparison.lr.dimensions>).forEach((k) => {
      if (comparison.lr.dimensions[k].label !== comparison.rf.dimensions[k].label) set.add(k);
    });
    return set;
  }, [comparison]);

  return (
    <main className="min-h-screen overflow-x-hidden text-foreground">
      {/* ─────────── MASTHEAD ─────────── */}
      <header className="border-b-[3px] border-foreground relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between gap-4 flex-wrap font-mono-zine text-xs sm:text-sm uppercase tracking-[0.2em] relative z-10">
          <span className="font-bold">Vol. 01 · Issue 01</span>
          <span className="hidden md:inline border border-foreground/30 px-3 py-1 rounded-full bg-foreground/5">An exploratory research zine</span>
          <span className="font-bold">April · MMXXVI</span>
        </div>
      </header>

      <div className="border-b-[6px] border-foreground bg-foreground/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-3 flex items-center justify-between gap-4 font-mono-zine text-[10px] sm:text-xs uppercase tracking-widest overflow-x-auto whitespace-nowrap hide-scrollbar">
          <a href="#read" className="hover:text-foreground/50 hover:translate-x-1 transition-all">→ Read Abstract</a>
          <a href="#analyze" className="hover:text-foreground/50 hover:translate-x-1 transition-all">→ Try the Tool</a>
          <a href="#method" className="hover:text-foreground/50 hover:translate-x-1 transition-all">→ Methodology</a>
          <a href="#caveat" className="hover:text-foreground/50 hover:translate-x-1 transition-all">→ Caveats</a>
        </div>
      </div>

      {/* ─────────── HERO ─────────── */}
      <section className="relative overflow-hidden">
        {/* Abstract background scribbles */}
        <div className="absolute top-10 right-[-10%] opacity-[0.03] pointer-events-none rotate-[20deg] scale-150">
          <img src={doodles} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-24 sm:pb-32 grid lg:grid-cols-12 gap-12 lg:gap-10 items-center relative z-10">
          {/* LEFT — title block */}
          <div className="lg:col-span-7 relative">
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="stamp bg-[#fef08a] !border-[#eab308] text-[#713f12] shadow-sm">Research Preview</span>
              <span className="font-hand text-2xl sm:text-3xl -rotate-2 text-foreground/80 mt-2 sm:mt-0">v0.1 — handle with care</span>
            </div>

            <h1 className="font-serif-zine font-bold leading-[0.85] tracking-tighter text-[clamp(4rem,11vw,9.5rem)] relative">
              <span className="block drop-shadow-sm">Mind</span>
              <span className="block italic text-foreground/90 ml-[-4px]">Print<span className="text-foreground/20">.</span></span>
            </h1>

            <p className="font-serif-zine text-2xl sm:text-4xl mt-10 leading-snug max-w-xl">
              What do your <span className="bg-[#e0f2fe] px-2 py-0.5 inline-block -rotate-1 shadow-sm text-[#082f49] leading-none pb-2 mt-1 border border-[#bae6fd]">words</span> reveal —
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              and how <span className="italic ink-underline decoration-[3px] underline-offset-4">certain</span> is the machine, really?
            </p>

            <div className="mt-12 flex items-center gap-6 flex-wrap">
              <a href="#analyze" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-foreground text-paper hover:bg-foreground/90 rounded-none h-16 sm:h-14 px-8 text-base font-mono-zine uppercase tracking-widest border-2 border-foreground shadow-[6px_6px_0_0_hsl(var(--ink))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_hsl(var(--ink))] transition-all active:shadow-none active:translate-x-[6px] active:translate-y-[6px]">
                  Begin the experiment →
                </Button>
              </a>
              <a href="#method" className="font-hand text-3xl underline underline-offset-[6px] decoration-2 decoration-foreground/30 hover:decoration-foreground hover:-rotate-2 inline-block transition-all text-center w-full sm:w-auto mt-4 sm:mt-0">
                or read the method
              </a>
            </div>

            {/* Footnote */}
            <div className="mt-14 sm:mt-16 flex items-start gap-4 max-w-md text-sm font-mono-zine text-foreground/70 p-4 border-l-4 border-foreground/20 bg-foreground/5 shadow-sm">
              <span className="text-2xl leading-none -mt-1 font-serif-zine">※</span>
              <p className="leading-relaxed">
                A study in <em>confidence-aware</em> personality classification.
                Predictions are hypotheses, not verdicts.
              </p>
            </div>
          </div>

          {/* RIGHT — character illustration */}
          <motion.div
            style={{ rotate: heroRotate, y: heroY }}
            className="lg:col-span-5 relative mt-16 lg:mt-0 hidden sm:block"
          >
            <div className="relative paper-card p-6 shadow-[12px_12px_0_0_hsl(var(--ink))] border-[3px] border-foreground bg-paper/90 backdrop-blur-sm rotate-2 hover:rotate-0 transition-transform duration-500 mx-auto max-w-sm lg:max-w-none">
              <div className="tape" style={{ top: '-16px', width: '100px', left: '50%', transform: 'translateX(-50%) rotate(-2deg)' }}></div>
              
              {/* speech bubbles labels */}
              <div className="absolute -top-6 left-2 font-hand text-2xl -rotate-[8deg] z-20 bg-[#fef08a] px-3 py-1 shadow-sm border border-[#fde047]">"hopeful"</div>
              <div className="absolute top-12 -right-6 font-hand text-2xl rotate-[6deg] z-20 bg-[#e0f2fe] px-3 py-1 shadow-sm border border-[#bae6fd]">"unsure"</div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 font-hand text-2xl z-20 bg-paper px-3 py-1 shadow-sm border border-foreground/20">"skeptical"</div>

              <div className="border border-foreground/10 rounded-sm overflow-hidden bg-foreground/5 p-4">
                <img
                  src={charTrio}
                  alt="Three people thinking — hand drawn"
                  width={1024}
                  height={1024}
                  className="w-full h-auto relative z-10 mix-blend-multiply opacity-90"
                />
              </div>

              {/* Annotation arrows */}
              <div className="absolute -bottom-6 -left-8 font-hand text-2xl flex items-center gap-2 -rotate-[6deg] bg-paper px-4 py-2 border-[2px] border-foreground shadow-sm z-20">
                <span>↳ 3 readers, 3 readings</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scrolling marquee */}
        <div className="border-y-[4px] border-foreground py-5 overflow-hidden bg-foreground text-[#fef08a] rotate-1 scale-105 origin-center shadow-2xl relative z-20">
          <div className="marquee font-serif-zine italic text-3xl sm:text-4xl tracking-wide">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex gap-16 shrink-0 font-bold">
                <span>★ confidence over confidence ★</span>
                <span className="text-paper">doubt is data</span>
                <span>★ a calibrated machine is a humble one ★</span>
                <span className="text-paper">read the model like you read a stranger</span>
                <span>★ words as evidence ★</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── ABSTRACT / READ ─────────── */}
      <section id="read" className="py-24 sm:py-32 relative">
        <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none rotate-12 scale-150">
          <img src={doodles} alt="" className="w-96 h-auto" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="paper-card p-10 sm:p-16 relative md:max-w-5xl mx-auto -rotate-1 hover:rotate-0 transition-transform duration-500 shadow-[8px_8px_0_0_hsl(var(--ink))]">
            <div className="tape" style={{ width: '120px', top: '-14px', left: '50%', transform: 'translateX(-50%) rotate(-1deg)' }}></div>
            
            <div className="grid md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left relative z-10">
                <div className="font-mono-zine text-[10px] uppercase tracking-[0.3em] text-foreground/80 mb-6 inline-block border-[2px] border-foreground px-4 py-1.5 rounded-full bg-paper drop-shadow-sm">
                  Abstract
                </div>
                <div className="font-hand text-5xl leading-tight mb-8">
                  The premise,<br />in plain words.
                </div>
                <div className="relative">
                  <div className="ink-circle absolute -inset-6 opacity-20 z-0"></div>
                  <img src={charWriter} alt="" width={300} height={350} className="w-56 h-auto relative z-10 animate-float-slow drop-shadow-sm" loading="lazy" />
                </div>
              </div>
              
              <div className="md:col-span-8 font-serif-zine text-2xl sm:text-3xl leading-snug border-l-0 md:border-l-[3px] border-dashed border-foreground/20 md:pl-12 relative z-10">
                <p className="first-letter:font-bold first-letter:text-8xl first-letter:float-left first-letter:mr-4 first-letter:leading-[0.85] first-letter:font-serif-zine">
                  Most personality classifiers <span className="bg-foreground text-paper px-2 py-0.5 shadow-sm inline-block -rotate-1">shout a single label</span> and hide their hesitation.
                  MindPrint does the opposite — it <span className="ink-underline decoration-red-600 decoration-[3px]">surfaces the doubt</span>.
                </p>
                <p className="mt-8 text-[1.1rem] sm:text-xl leading-relaxed text-foreground/80 font-mono-zine">
                  You write a paragraph. Two models read it. They tell you not only <em className="text-foreground bg-foreground/10 px-1.5 py-0.5 border border-foreground/20 shadow-sm rounded-sm">what</em> they see,
                  but <em className="text-foreground bg-foreground/10 px-1.5 py-0.5 border border-foreground/20 shadow-sm rounded-sm">how strongly</em> they see it — and where they disagree. The result is something closer
                  to a conversation with a careful reader than a verdict from an oracle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider label="§ 01 — Procedure" />

      {/* ─────────── ANALYZE ─────────── */}
      <section id="analyze" className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 relative">
          
          {/* Creative Post-it Notes */}
          <div className="hidden sm:block absolute -left-10 lg:-left-16 top-0 lg:top-12 -rotate-6 bg-[#fef08a] p-4 w-40 sm:w-48 shadow-md border border-[#fde047] z-10 hover:rotate-0 transition-transform">
            <div className="font-hand text-xl sm:text-2xl leading-tight text-[#451a03]">Try describing your ideal Sunday...</div>
          </div>
          <div className="hidden sm:block absolute -right-4 lg:-right-8 -top-10 lg:-top-6 rotate-3 bg-[#e0f2fe] p-4 w-44 sm:w-52 shadow-md border border-[#bae6fd] z-10 hover:-rotate-1 transition-transform">
            <div className="tape"></div>
            <div className="font-hand text-xl sm:text-2xl leading-tight text-[#082f49] mt-2">Or just rant about something that annoyed you today!</div>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-start mb-12 relative z-20">
            <div className="md:col-span-8">
              <div className="font-mono-zine text-[10px] uppercase tracking-[0.3em] mb-4 inline-block bg-foreground text-paper px-3 py-1 shadow-sm">Step 01 — Input</div>
              <h2 className="font-serif-zine font-bold text-5xl sm:text-7xl leading-[0.9] tracking-tight">
                Write something <span className="italic relative inline-block">honest.<div className="absolute -bottom-1 left-0 right-0 h-3 bg-[#fef08a] -z-10 -rotate-1"></div></span>
              </h2>
              <p className="font-hand text-2xl sm:text-3xl mt-6 text-foreground/80 -rotate-1">
                30+ words. The longer & more spontaneous, the better.
              </p>
            </div>
            <div className="md:col-span-4 flex justify-start md:justify-end mt-6 md:mt-0">
              <img src={charWriter} alt="" width={300} height={350} className="w-32 sm:w-40 h-auto animate-bob drop-shadow-sm" loading="lazy" />
            </div>
          </div>

          {/* The notebook */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="paper-card p-2 relative z-20 shadow-[8px_8px_0_0_hsl(var(--ink))]"
          >
            {/* notebook spiral binding */}
            <div className="absolute -top-3 left-4 right-4 flex justify-between gap-2 overflow-hidden pointer-events-none z-10">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="w-2 h-6 rounded-full bg-foreground/90 shadow-md border border-paper flex-shrink-0" />
              ))}
            </div>

            <div className="paper-lines p-6 sm:p-8 pt-10 sm:pt-12 relative overflow-hidden bg-[#fcfbf9]">
              {/* Realistic red margin line for the notebook */}
              <div className="absolute left-6 sm:left-14 top-0 bottom-0 w-[1.5px] bg-red-500/40 z-0"></div>
              
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Today I was thinking about..."
                className="min-h-[260px] resize-y text-xl sm:text-2xl bg-transparent border-0 focus-visible:ring-0 placeholder:text-foreground/30 rounded-none leading-8 font-serif-zine p-0 shadow-none relative z-10 pl-4 sm:pl-10 outline-none"
                style={{ lineHeight: "32px" }}
              />
            </div>

            <div className="px-6 sm:px-8 pb-3 pt-2 flex items-center justify-between flex-wrap gap-2 font-mono-zine text-xs bg-paper border-t border-foreground/10">
              <div>
                <span className="font-bold text-foreground text-sm tabular-nums">{wordCount.toString().padStart(3, "0")}</span>
                <span className="text-foreground/60"> / words</span>
                <span className="text-foreground/40 hidden sm:inline"> · target ≥ 030</span>
              </div>
              {tooShort && (
                <div className="font-hand text-xl sm:text-2xl rotate-1 text-red-600 font-bold animate-pulse">
                  ← need a few more words!
                </div>
              )}
            </div>
          </motion.div>

          {/* Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row flex-wrap gap-4 items-center relative z-20">
            <Button
              onClick={handleAnalyze}
              disabled={loading !== null}
              className="w-full sm:w-auto bg-foreground text-paper hover:bg-foreground/90 rounded-none h-16 sm:h-14 px-8 text-base font-mono-zine uppercase tracking-widest border-[2px] border-foreground shadow-[6px_6px_0_0_hsl(var(--ink))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_hsl(var(--ink))] transition-all active:shadow-none active:translate-x-[6px] active:translate-y-[6px] group"
            >
              {loading === "single" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Analyze <span className="group-hover:translate-x-1 transition-transform ml-2">→</span>
            </Button>
            <Button
              onClick={handleCompare}
              disabled={loading !== null}
              variant="outline"
              className="w-full sm:w-auto bg-paper text-foreground hover:bg-foreground hover:text-paper rounded-none h-16 sm:h-14 px-8 text-base font-mono-zine uppercase tracking-widest border-[2px] border-foreground shadow-[6px_6px_0_0_hsl(var(--ink))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_hsl(var(--ink))] transition-all active:shadow-none active:translate-x-[6px] active:translate-y-[6px]"
            >
              {loading === "compare" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Compare both
            </Button>
            <div className="relative flex items-center mt-6 sm:mt-0 sm:ml-4 self-center sm:self-auto">
              <span className="font-hand text-2xl text-foreground/70 -rotate-2 hidden sm:block">
                ← pick your path
              </span>
              <span className="font-hand text-2xl text-foreground/70 -rotate-2 sm:hidden">
                ↑ pick your path
              </span>
              <img src={charShrug} alt="" className="w-12 h-auto ml-2 sm:ml-4 opacity-80 -rotate-6 hover:rotate-6 transition-transform cursor-crosshair hidden sm:block drop-shadow-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── RESULTS ─────────── */}
      {(single || comparison) && (
        <section id="results" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-10">
            <Divider label={comparison ? "§ 02 — Findings (two readings)" : "§ 02 — Findings"} />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 text-center"
            >
              <h2 className="font-serif-zine font-bold text-4xl sm:text-6xl tracking-tight">
                {comparison ? "Two models. One mirror." : "Your linguistic fingerprint."}
              </h2>
              <p className="font-hand text-2xl mt-3 text-foreground/70">
                {comparison ? "watch where they disagree — that's the interesting part" : "read the certainty as carefully as the prediction"}
              </p>
            </motion.div>

            {single && <ResultCard result={single} />}
            {comparison && (
              <div className="grid md:grid-cols-2 gap-8">
                <ResultCard result={comparison.lr} title="Reader A · Logistic Regression" highlightDiff={diffKeys} compact />
                <ResultCard result={comparison.rf} title="Reader B · Random Forest" highlightDiff={diffKeys} compact />
              </div>
            )}
          </div>
        </section>
      )}

      <Divider label="§ 03 — Method" />

      {/* ─────────── METHOD ─────────── */}
      <section id="method" className="py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="grid md:grid-cols-12 gap-10 items-start mb-16 relative z-10">
            <div className="md:col-span-7">
              <div className="font-mono-zine text-[10px] uppercase tracking-[0.3em] mb-6 inline-block border border-foreground/20 px-3 py-1 rounded-full">Methodology</div>
              <h2 className="font-serif-zine font-bold text-5xl sm:text-7xl leading-[0.95] tracking-tight">
                Predictions are <span className="ink-underline">easy</span>.
                <br />
                <span className="italic text-foreground/80 mt-3 inline-block"><span className="bg-[#fef08a] px-2 py-1 leading-tight text-[#451a03]">Knowing when to trust them isn't.</span></span>
              </h2>
            </div>
            <div className="md:col-span-5 relative flex justify-center md:justify-end">
              <img src={charScientist} alt="" width={300} height={350} className="w-56 h-auto animate-float-slow relative z-10" loading="lazy" />
              <div className="absolute top-1/3 -left-4 font-hand text-3xl text-foreground/60 rotate-[12deg] hidden md:block">
                ↓ the breakdown
              </div>
            </div>
          </div>

          {/* Three cards */}
          <div className="grid md:grid-cols-3 gap-8 relative z-20">
            {[
              {
                num: "01",
                title: "Four axes",
                hand: "split, don't squash",
                text: "We predict each MBTI dichotomy (I·E, N·S, T·F, J·P) independently. No forced typology collapse.",
                bg: "bg-paper",
                rotate: "-rotate-2",
                stampColor: "text-foreground/5"
              },
              {
                num: "02",
                title: "Calibrated certainty",
                hand: "high · moderate · low",
                text: "Per-dimension probabilities. Three trust tiers: ≥ 70% (trust it), ≥ 50% (maybe), otherwise (doubt it).",
                bg: "bg-[#e0f2fe]",
                rotate: "rotate-1",
                stampColor: "text-[#082f49]/5"
              },
              {
                num: "03",
                title: "Two lenses",
                hand: "linear vs. forest",
                text: "Logistic Regression and a Random Forest read the same text. Disagreement is signal, not noise.",
                bg: "bg-[#fef08a]",
                rotate: "-rotate-3",
                stampColor: "text-[#451a03]/5"
              },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`paper-card p-8 relative hover:rotate-0 transition-transform shadow-[6px_6px_0_0_hsl(var(--ink))] ${c.bg} ${c.rotate}`}
              >
                <div className="tape"></div>
                <div className={`absolute -top-6 -right-2 font-serif-zine font-bold text-9xl leading-none rotate-12 pointer-events-none select-none ${c.stampColor}`}>{c.num}</div>
                <h3 className="font-serif-zine font-bold text-3xl tracking-tight mb-1 relative z-10">{c.title}</h3>
                <div className="font-hand text-xl text-foreground/70 mb-4 -rotate-1 relative z-10">↳ {c.hand}</div>
                <p className="text-base text-foreground/80 leading-relaxed font-mono-zine relative z-10">{c.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Confidence legend */}
          <div className="mt-20 paper-card p-8 sm:p-12 relative rotate-1 shadow-[8px_8px_0_0_hsl(var(--ink))] max-w-3xl mx-auto">
            <div className="tape"></div>
            {/* Real post-it note instead of floating text */}
            <div className="absolute -top-8 -left-4 sm:-left-10 bg-[#fef08a] px-4 py-2 rotate-[-12deg] shadow-sm border border-[#fde047] z-10">
              <div className="tape" style={{ width: '40px', top: '-8px' }}></div>
              <div className="font-hand text-3xl text-[#451a03] mt-1">* Important!</div>
            </div>
            
            <div className="font-mono-zine text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-8 border-b border-foreground/20 pb-4">
              Reading the bars
            </div>
            <div className="flex flex-col gap-6 font-serif-zine">
              {[
                { glyph: "✓✓", label: "High confidence", range: "≥ 70%", note: "the model is fairly committed", color: "text-[#16a34a]", bg: "bg-[#16a34a]/10" },
                { glyph: "≈", label: "Moderate", range: "50 – 69%", note: "leaning, but watch it", color: "text-[#ca8a04]", bg: "bg-[#ca8a04]/10" },
                { glyph: "?", label: "Low", range: "< 50%", note: "essentially a coin flip", color: "text-[#dc2626]", bg: "bg-[#dc2626]/10" },
              ].map((l) => (
                <div key={l.label} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pb-6 border-b border-foreground/10 last:border-0 last:pb-0">
                  <div className={`flex items-center justify-center w-16 h-16 rounded-full ${l.bg} ${l.color} shrink-0 border border-foreground/5`}>
                    <span className="text-4xl font-hand leading-none mt-2">{l.glyph}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-3 mb-1">
                      <span className="text-3xl font-serif-zine font-bold">{l.label}</span>
                      <span className="font-mono-zine text-sm text-foreground/70 bg-foreground/5 px-2 py-0.5 rounded">{l.range}</span>
                    </div>
                    <div className="font-hand text-2xl text-foreground/60 leading-tight">↳ {l.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider label="§ 04 — A word of caution" />

      {/* ─────────── CAVEAT ─────────── */}
      <section id="caveat" className="py-16 sm:py-28 relative overflow-hidden">
        {/* Background scribble / ink */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 sm:px-10 relative z-10">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 relative flex justify-center">
              <div className="relative">
                <img src={charShrug} alt="" width={300} height={350} className="w-64 h-auto relative z-10 hover:-rotate-3 transition-transform drop-shadow-sm" loading="lazy" />
                <div className="absolute -top-4 -right-12 font-hand text-3xl text-red-600/80 rotate-[15deg]">
                  * seriously!
                </div>
              </div>
            </div>
            
            <div className="md:col-span-7">
              <div className="font-mono-zine text-[10px] uppercase tracking-[0.3em] mb-4 inline-block border border-red-500/30 text-red-700/80 px-3 py-1 rounded-full bg-red-500/5">Disclosure</div>
              <h2 className="font-serif-zine font-bold text-5xl sm:text-6xl leading-[0.95] tracking-tight mb-10">
                An exploratory instrument —
                <br />
                <span className="italic text-red-600/90 underline decoration-red-500/30 decoration-[6px] underline-offset-[8px] mt-2 inline-block">not a diagnostic tool.</span>
              </h2>

              <div className="paper-card p-8 sm:p-10 font-serif-zine text-xl leading-relaxed relative border-l-[6px] border-l-red-500 shadow-[8px_8px_0_0_rgba(239,68,68,0.15)] bg-paper">
                <div className="tape"></div>
                <div className="absolute -bottom-8 -right-4 font-serif-zine font-bold text-8xl leading-none rotate-[-10deg] text-red-500/5 pointer-events-none select-none">
                  CAVEAT
                </div>
                
                <p className="mb-6 relative z-10">
                  MindPrint is built for inquiry. It uses MBTI as a convenient — though
                  psychometrically contested — proxy for personality structure. Outputs are
                  statistical inferences over lexical features, <em className="bg-red-500/10 text-red-700 px-1 font-bold">not</em> psychological assessments.
                </p>
                <div className="h-px w-full bg-gradient-to-r from-red-500/30 to-transparent my-6"></div>
                <p className="font-hand text-[1.4rem] mt-4 relative z-10 text-foreground/80 -rotate-1 leading-snug">
                  ↳ treat predictions as <span className="ink-underline decoration-red-400">hypotheses</span> to be examined, not conclusions about who you are.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── COLOPHON / FOOTER ─────────── */}
      <footer className="border-t-[12px] border-foreground mt-20 relative overflow-hidden bg-foreground text-paper pb-12">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <img src={doodles} alt="" className="w-full h-full object-cover object-center invert" loading="lazy" />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-20 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 items-start">
            <div className="md:col-span-2 relative">
              <div className="flex items-center gap-3 mb-6">
                <span className="stamp !border-paper !bg-foreground !text-paper">End of Vol. 01</span>
              </div>
              <div className="font-serif-zine font-bold text-5xl sm:text-6xl mb-6 tracking-tight">MindPrint.</div>
              <div className="font-hand text-3xl text-paper/80 max-w-md leading-tight -rotate-1">
                "Doubt is the most honest part of a model."
              </div>
            </div>

            <div className="flex flex-col gap-4 font-mono-zine text-xs uppercase tracking-[0.2em] text-paper/60 md:mt-0 mt-8">
              <span className="text-paper/30 mb-1 border-b border-paper/10 pb-2">Resources</span>
              <a href="https://github.com/oathar/research-project" target="_blank" rel="noreferrer" className="hover:text-paper hover:translate-x-1 transition-all">→ Source Code</a>
              <a href="https://www.kaggle.com/datasets/datasnaek/mbti-type" target="_blank" rel="noreferrer" className="hover:text-paper hover:translate-x-1 transition-all">→ Kaggle Dataset</a>
              <a href="#method" className="hover:text-paper hover:translate-x-1 transition-all">→ Read the Method</a>
            </div>

            <div className="flex flex-col gap-4 font-mono-zine text-xs uppercase tracking-[0.2em] text-paper/60">
              <span className="text-paper/30 mb-1 border-b border-paper/10 pb-2">Legal</span>
              <span className="hover:text-paper transition-all cursor-default">→ MIT License</span>
              <span className="mt-4 pt-4 border-t border-paper/10 text-paper/40">© MMXXVI</span>
              
              <div className="mt-6 pt-6 border-t border-paper/10">
                <p className="font-mono-zine text-[10px] uppercase tracking-[0.3em] text-paper/40 mb-2">The human behind this...</p>
                <a 
                  href="https://www.oathar.dev/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3"
                >
                  <span className="font-hand text-3xl text-paper group-hover:text-white transition-colors -rotate-2 group-hover:-translate-y-1 group-hover:rotate-0 duration-300 whitespace-nowrap">
                    Athar Ramzan
                  </span>
                  <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 font-serif-zine italic text-sm text-paper/60 transition-all duration-300">
                    portfolio ↗
                  </span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-24 pt-8 border-t border-paper/20 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono-zine text-[10px] uppercase tracking-[0.2em] text-paper/40">
            <span>Built for inquiry, not clinical certainty.</span>
            <span>A study in confidence-aware classification.</span>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
