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
      <header className="border-b-2 border-foreground">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-3 flex items-center justify-between gap-4 flex-wrap font-mono-zine text-[11px] uppercase tracking-widest">
          <span>Vol. 01 · Issue 01</span>
          <span className="hidden sm:inline">An exploratory research zine</span>
          <span>April · MMXXVI</span>
        </div>
      </header>

      <div className="border-b-4 border-foreground">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-2 flex items-center justify-between gap-4 font-mono-zine text-[10px] uppercase tracking-widest">
          <a href="#read" className="hover:underline">→ Read</a>
          <a href="#analyze" className="hover:underline">→ Try it</a>
          <a href="#method" className="hover:underline">→ Method</a>
          <a href="#caveat" className="hover:underline">→ Caveats</a>
        </div>
      </div>

      {/* ─────────── HERO ─────────── */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-14 pb-20 grid lg:grid-cols-12 gap-10 items-end">
          {/* LEFT — title block */}
          <div className="lg:col-span-7 relative">
            <div className="flex items-center gap-3 mb-6">
              <span className="stamp">Research Preview</span>
              <span className="font-hand text-2xl -rotate-2">v0.1 — handle with care</span>
            </div>

            <h1 className="font-serif-zine font-bold leading-[0.88] tracking-tighter text-[clamp(3.5rem,11vw,9rem)]">
              <span className="block">Mind</span>
              <span className="block italic">Print<span className="text-foreground/30">.</span></span>
            </h1>

            <p className="font-serif-zine text-2xl sm:text-4xl mt-8 leading-tight max-w-xl">
              What do your <Circled>words</Circled> reveal —
              <br />
              and how <span className="italic ink-underline">certain</span> is the machine, really?
            </p>

            <div className="mt-10 flex items-center gap-5 flex-wrap">
              <a href="#analyze">
                <Button className="bg-foreground text-paper hover:bg-foreground/90 rounded-none h-14 px-8 text-base font-mono-zine uppercase tracking-widest border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--ink))] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_hsl(var(--ink))] transition-all">
                  Begin the experiment →
                </Button>
              </a>
              <a href="#method" className="font-hand text-3xl underline underline-offset-4 decoration-2 hover:rotate-1 inline-block transition-transform">
                or read the method
              </a>
            </div>

            {/* Footnote */}
            <div className="mt-10 flex items-start gap-2 max-w-md text-sm font-mono-zine text-foreground/60">
              <span>※</span>
              <p>
                A study in <em>confidence-aware</em> personality classification.
                Predictions are hypotheses, not verdicts.
              </p>
            </div>
          </div>

          {/* RIGHT — character illustration */}
          <motion.div
            style={{ rotate: heroRotate, y: heroY }}
            className="lg:col-span-5 relative"
          >
            <div className="relative">
              {/* speech bubbles labels */}
              <div className="absolute -top-4 left-2 font-hand text-xl -rotate-6 z-10 bg-paper px-2">"hopeful"</div>
              <div className="absolute top-8 right-0 font-hand text-xl rotate-3 z-10 bg-paper px-2">"unsure"</div>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 font-hand text-xl z-10 bg-paper px-2">"skeptical"</div>

              <img
                src={charTrio}
                alt="Three people thinking — hand drawn"
                width={1024}
                height={1024}
                className="w-full h-auto relative z-0"
              />

              {/* Annotation arrows */}
              <div className="absolute -bottom-4 -left-4 font-hand text-xl flex items-center gap-1 -rotate-6">
                <HandArrow className="w-12 h-8" />
                <span>three readers, three readings</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scrolling marquee */}
        <div className="border-y-2 border-foreground py-4 overflow-hidden bg-foreground text-paper">
          <div className="marquee font-serif-zine italic text-2xl sm:text-3xl">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex gap-12 shrink-0">
                <span>★ confidence over confidence ★</span>
                <span>doubt is data</span>
                <span>★ a calibrated machine is a humble one ★</span>
                <span>read the model like you read a stranger</span>
                <span>★ words as evidence ★</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── ABSTRACT / READ ─────────── */}
      <section id="read" className="py-24 sm:py-32 relative">
        <div className="absolute top-10 right-10 opacity-10 pointer-events-none rotate-12">
          <img src={doodles} alt="" className="w-96 h-auto" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="paper-card p-10 sm:p-16 relative md:max-w-5xl mx-auto -rotate-1 hover:rotate-0 transition-transform duration-500">
            {/* Tape effect */}
            <div className="tape"></div>
            
            <div className="grid md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="font-mono-zine text-[10px] uppercase tracking-[0.3em] text-foreground/50 mb-4 inline-block border border-foreground/20 px-3 py-1 rounded-full">
                  Abstract
                </div>
                <div className="font-hand text-4xl leading-tight mb-8">
                  The premise,<br />in plain words.
                </div>
                <div className="relative">
                  <div className="ink-circle absolute -inset-4 opacity-20 z-0"></div>
                  <img src={charWriter} alt="" width={300} height={350} className="w-48 h-auto relative z-10 animate-float-slow" loading="lazy" />
                </div>
              </div>
              
              <div className="md:col-span-8 font-serif-zine text-2xl sm:text-3xl leading-snug border-l-0 md:border-l-2 border-dashed border-foreground/20 md:pl-12">
                <p className="first-letter:font-bold first-letter:text-8xl first-letter:float-left first-letter:mr-4 first-letter:leading-[0.8] first-letter:font-serif-zine">
                  Most personality classifiers shout a single label and hide their hesitation.
                  MindPrint does the opposite — it <span className="ink-underline">surfaces the doubt</span>.
                </p>
                <p className="mt-8 text-[1.1rem] leading-relaxed text-foreground/80 font-mono-zine">
                  You write a paragraph. Two models read it. They tell you not only <em className="text-foreground bg-foreground/10 px-1 rounded">what</em> they see,
                  but <em className="text-foreground bg-foreground/10 px-1 rounded">how strongly</em> they see it — and where they disagree. The result is something closer
                  to a conversation with a careful reader than a verdict from an oracle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider label="§ 01 — Procedure" />

      {/* ─────────── ANALYZE ─────────── */}
      <section id="analyze" className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 relative">
          
          {/* Creative Post-it Notes */}
          <div className="hidden lg:block absolute -left-16 top-12 -rotate-6 bg-[#fef08a] p-4 w-40 shadow-sm border border-[#fde047] z-10 hover:rotate-0 transition-transform">
            <div className="font-hand text-xl leading-tight text-[#451a03]">Try describing your ideal Sunday...</div>
          </div>
          <div className="hidden lg:block absolute -right-4 -top-6 rotate-3 bg-[#e0f2fe] p-4 w-48 shadow-sm border border-[#bae6fd] z-10 hover:-rotate-1 transition-transform">
            <div className="tape"></div>
            <div className="font-hand text-xl leading-tight text-[#082f49] mt-2">Or just rant about something that annoyed you today!</div>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-start mb-10 relative z-20">
            <div className="md:col-span-8">
              <div className="font-mono-zine text-[10px] uppercase tracking-[0.3em] mb-3">Step 01 — Input</div>
              <h2 className="font-serif-zine font-bold text-5xl sm:text-7xl leading-[0.9] tracking-tight">
                Write something <span className="italic">honest</span>.
              </h2>
              <p className="font-hand text-2xl mt-4 text-foreground/70 -rotate-1">
                30+ words. The longer & more spontaneous, the better.
              </p>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <img src={charWriter} alt="" width={300} height={350} className="w-40 h-auto animate-bob" loading="lazy" />
            </div>
          </div>

          {/* The notebook */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="paper-card p-2 relative z-20"
          >
            {/* notebook spiral binding */}
            <div className="absolute -top-2 left-0 right-0 flex justify-around pointer-events-none z-10">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-1.5 h-4 rounded-full bg-foreground/80 shadow-sm" />
              ))}
            </div>

            <div className="paper-lines p-6 sm:p-8 pt-10 relative overflow-hidden">
              {/* Realistic red margin line for the notebook */}
              <div className="absolute left-10 sm:left-14 top-0 bottom-0 w-[1.5px] bg-red-400/40 z-0 hidden sm:block"></div>
              
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Today I was thinking about..."
                className="min-h-[260px] resize-y text-xl sm:text-2xl bg-transparent border-0 focus-visible:ring-0 placeholder:text-foreground/30 rounded-none leading-8 font-serif-zine p-0 shadow-none relative z-10 sm:pl-10"
                style={{ lineHeight: "32px" }}
              />
            </div>

            <div className="px-6 sm:px-8 pb-2 pt-1 flex items-center justify-between flex-wrap gap-2 font-mono-zine text-xs bg-paper">
              <div>
                <span className="font-bold text-foreground tabular-nums">{wordCount.toString().padStart(3, "0")}</span>
                <span className="text-foreground/60"> / words</span>
                <span className="text-foreground/40"> · target ≥ 030</span>
              </div>
              {tooShort && (
                <div className="font-hand text-xl rotate-1 text-red-600/80 font-bold">
                  ← need a few more words!
                </div>
              )}
            </div>
          </motion.div>

          {/* Buttons */}
          <div className="mt-10 flex flex-wrap gap-4 items-center relative z-20">
            <Button
              onClick={handleAnalyze}
              disabled={loading !== null}
              className="bg-foreground text-paper hover:bg-foreground/90 rounded-none h-14 px-8 text-base font-mono-zine uppercase tracking-widest border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--ink))] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_hsl(var(--ink))] transition-all group"
            >
              {loading === "single" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Analyze <span className="group-hover:translate-x-1 transition-transform ml-2">→</span>
            </Button>
            <Button
              onClick={handleCompare}
              disabled={loading !== null}
              variant="outline"
              className="bg-paper text-foreground hover:bg-foreground hover:text-paper rounded-none h-14 px-8 text-base font-mono-zine uppercase tracking-widest border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--ink))] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_hsl(var(--ink))] transition-all"
            >
              {loading === "compare" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Compare both
            </Button>
            <div className="relative flex items-center mt-4 sm:mt-0 ml-2">
              <span className="font-hand text-2xl text-foreground/70 -rotate-2">
                ← pick your path
              </span>
              <img src={charShrug} alt="" className="w-12 h-auto ml-4 opacity-80 -rotate-6 hover:rotate-6 transition-transform cursor-crosshair" />
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
      <section id="method" className="py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="grid md:grid-cols-12 gap-10 items-start mb-14">
            <div className="md:col-span-7">
              <div className="font-mono-zine text-[10px] uppercase tracking-[0.3em] mb-3">Methodology</div>
              <h2 className="font-serif-zine font-bold text-5xl sm:text-7xl leading-[0.9] tracking-tight">
                Predictions are easy.
                <br />
                <span className="italic text-foreground/60">Knowing when to trust them isn't.</span>
              </h2>
            </div>
            <div className="md:col-span-5">
              <img src={charScientist} alt="" width={300} height={350} className="w-48 h-auto animate-float-slow" loading="lazy" />
            </div>
          </div>

          {/* Three cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Four axes",
                hand: "split, don't squash",
                text: "We predict each MBTI dichotomy (I·E, N·S, T·F, J·P) independently. No forced typology collapse.",
              },
              {
                num: "02",
                title: "Calibrated certainty",
                hand: "high · moderate · low",
                text: "Per-dimension probabilities. Three trust tiers: ≥ 70% (trust it), ≥ 50% (maybe), otherwise (doubt it).",
              },
              {
                num: "03",
                title: "Two lenses",
                hand: "linear vs. forest",
                text: "Logistic Regression and a Random Forest read the same text. Disagreement is signal, not noise.",
              },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="paper-card-soft p-7 relative wobble"
              >
                <div className="font-serif-zine font-bold text-7xl text-foreground/15 leading-none mb-4">{c.num}</div>
                <h3 className="font-serif-zine font-bold text-3xl tracking-tight mb-1">{c.title}</h3>
                <div className="font-hand text-xl text-foreground/70 mb-4 -rotate-1">↳ {c.hand}</div>
                <p className="text-base text-foreground/80 leading-relaxed">{c.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Confidence legend */}
          <div className="mt-16 paper-card-soft p-7">
            <div className="font-mono-zine text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-4">
              Reading the bars
            </div>
            <div className="grid sm:grid-cols-3 gap-6 font-serif-zine">
              {[
                { glyph: "✓✓", label: "High confidence", range: "≥ 70%", note: "the model is fairly committed" },
                { glyph: "≈", label: "Moderate", range: "50 – 69%", note: "leaning, but watch it" },
                { glyph: "?", label: "Low", range: "< 50%", note: "essentially a coin flip" },
              ].map((l) => (
                <div key={l.label} className="border-l-2 border-foreground pl-4">
                  <div className="text-3xl font-hand">{l.glyph} {l.label}</div>
                  <div className="font-mono-zine text-xs mt-1 text-foreground/60">{l.range}</div>
                  <div className="font-hand text-xl text-foreground/70 mt-1">— {l.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider label="§ 04 — A word of caution" />

      {/* ─────────── CAVEAT ─────────── */}
      <section id="caveat" className="py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <div className="grid md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-4">
              <img src={charShrug} alt="" width={300} height={350} className="w-56 h-auto" loading="lazy" />
            </div>
            <div className="md:col-span-8">
              <div className="font-mono-zine text-[10px] uppercase tracking-[0.3em] mb-3">Disclosure</div>
              <h2 className="font-serif-zine font-bold text-4xl sm:text-6xl leading-[0.95] tracking-tight mb-8">
                An exploratory instrument —
                <br />
                <span className="italic text-foreground/60">not a diagnostic tool.</span>
              </h2>

              <div className="paper-card-soft p-6 sm:p-8 font-serif-zine text-xl leading-relaxed">
                <p className="mb-4">
                  MindPrint is built for inquiry. It uses MBTI as a convenient — though
                  psychometrically contested — proxy for personality structure. Outputs are
                  statistical inferences over lexical features, <em>not</em> psychological assessments.
                </p>
                <p className="font-hand text-2xl mt-6">
                  ↳ treat predictions as hypotheses to be examined, not conclusions about who you are.
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
