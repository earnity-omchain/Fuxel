import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── Constants ───────────────────────────────────────────────────────────────
const ACCENT = "#D4AF37";
const POST_URL = "https://x.com/i/status/2061551157785542955";

// ─── Glitch hook ─────────────────────────────────────────────────────────────
const GLITCH = "!<>-_\\/[]{}—=+*^?#▓░▒";
function glitch(str: string) {
  return str.split("").map(c => Math.random() > 0.65 ? GLITCH[Math.floor(Math.random() * GLITCH.length)] : c).join("");
}
function useGlitch(text: string, interval = 3000) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.6) {
        let n = 0;
        const flicker = setInterval(() => {
          setDisplay(glitch(text));
          if (++n > 6) { clearInterval(flicker); setDisplay(text); }
        }, 50);
      }
    }, interval);
    return () => clearInterval(id);
  }, [text, interval]);
  return display;
}

// ─── Particle field ──────────────────────────────────────────────────────────
function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const count = 55;
    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.4 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${d.a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

// ─── Progress ring ────────────────────────────────────────────────────────────
function ProgressRing({ progress, total }: { progress: number; total: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const filled = (progress / total) * circ;
  return (
    <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="5" />
      <circle
        cx="65" cy="65" r={r} fill="none"
        stroke={ACCENT} strokeWidth="5"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

// ─── Check icon ───────────────────────────────────────────────────────────────
function Check() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Step card ────────────────────────────────────────────────────────────────
interface StepCardProps {
  num: string;
  label: string;
  sub?: string;
  done: boolean;
  loading: boolean;
  actionLabel: string;
  onAction: () => void;
  children?: React.ReactNode;
}
function StepCard({ num, label, sub, done, loading, actionLabel, onAction, children }: StepCardProps) {
  return (
    <div style={{
      background: done ? "rgba(212,175,55,0.04)" : "rgba(8,8,8,0.7)",
      border: `1px solid ${done ? "rgba(212,175,55,0.22)" : "rgba(255,255,255,0.055)"}`,
      padding: "22px 24px",
      transition: "all 0.35s ease",
      backdropFilter: "blur(8px)",
      position: "relative",
      overflow: "hidden",
    }}>
      {done && (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
      )}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flex: 1 }}>
          {/* Step number */}
          <div style={{
            width: 32, height: 32, flexShrink: 0,
            border: `1px solid ${done ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.08)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 11,
            color: done ? ACCENT : "rgba(255,255,255,0.2)",
            transition: "all 0.3s",
            background: done ? "rgba(212,175,55,0.07)" : "transparent",
          }}>
            {done ? <Check /> : num}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13,
              color: done ? ACCENT : "rgba(255,255,255,0.8)",
              letterSpacing: "0.03em", transition: "color 0.3s", marginBottom: sub ? 3 : 0,
            }}>{label}</div>
            {sub && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', monospace", lineHeight: 1.5 }}>{sub}</div>}
            {children}
          </div>
        </div>

        {/* Action button */}
        <div style={{ flexShrink: 0 }}>
          {done ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "7px 14px", border: "1px solid rgba(212,175,55,0.2)",
              background: "rgba(212,175,55,0.06)", fontSize: 9,
              fontFamily: "'Space Grotesk', monospace", fontWeight: 700,
              letterSpacing: "0.3em", textTransform: "uppercase", color: ACCENT,
            }}>
              <Check /> DONE
            </div>
          ) : (
            <button
              onClick={onAction}
              disabled={loading}
              style={{
                padding: "8px 18px",
                background: loading ? "rgba(80,10,10,0.5)" : "linear-gradient(135deg, rgba(139,0,0,0.75), rgba(80,0,0,0.75))",
                border: "1px solid rgba(212,175,55,0.2)",
                color: ACCENT,
                fontFamily: "'Space Grotesk', monospace",
                fontWeight: 700, fontSize: 9,
                letterSpacing: "0.3em", textTransform: "uppercase",
                cursor: loading ? "wait" : "pointer",
                transition: "all 0.2s",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "···" : actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ wallet, xUsername }: { wallet: string; xUsername: string }) {
  const g = useGlitch("APPLICATION RECEIVED");
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#040404", padding: 24, textAlign: "center", position: "relative" }}>
      <Particles />
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(10,50,20,0.35) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 420 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.7em", color: "rgba(212,175,55,0.35)", fontFamily: "'Space Grotesk', monospace", textTransform: "uppercase", marginBottom: 24 }}>
          {g}
        </div>
        <div style={{ fontSize: 72, marginBottom: 20, filter: "drop-shadow(0 0 40px rgba(212,175,55,0.4))" }}>♦</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: "clamp(28px,8vw,48px)", color: ACCENT, marginBottom: 12, textShadow: "0 0 40px rgba(212,175,55,0.3)" }}>
          Seat Secured.
        </h2>
        <div style={{ width: 60, height: 1, background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`, margin: "0 auto 20px" }} />
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Space Grotesk', monospace", lineHeight: 2, marginBottom: 32 }}>
          The house has your name.<br />
          The foxes are watching.<br />
          See you at the table.
        </p>
        <div style={{ border: "1px solid rgba(212,175,55,0.12)", background: "rgba(212,175,55,0.03)", padding: "18px 22px", fontFamily: "'Space Grotesk', monospace", fontSize: 11, color: "rgba(212,175,55,0.5)", wordBreak: "break-all", marginBottom: 10 }}>
          {wallet}
        </div>
        {xUsername && (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "'Space Grotesk', monospace", letterSpacing: "0.1em" }}>
            @{xUsername}
          </div>
        )}
      </div>
      <Style />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const headline = useGlitch("WHITELIST");

  // Form state
  const [xUsername, setXUsername] = useState("");
  const [quoteLink, setQuoteLink] = useState("");
  const [commentLink, setCommentLink] = useState("");
  const [wallet, setWallet] = useState("");

  // Task completion
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  // Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalTasks = 4;
  const completedCount = done.size;

  const markDone = (id: string) => setDone(prev => new Set([...prev, id]));

  const openAndMark = async (id: string, url: string) => {
    if (done.has(id)) return;
    window.open(url, "_blank", "noopener,noreferrer");
    setLoading(id);
    await new Promise(r => setTimeout(r, 1100));
    markDone(id);
    setLoading(null);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!xUsername.trim()) e.xUsername = "Enter your X username.";
    if (!done.has("follow")) e.follow = "Follow @FuxelNFT first.";
    if (!done.has("likeQuote")) e.likeQuote = "Like and quote the post first.";
    if (!quoteLink.trim()) e.quoteLink = "Paste your quote tweet link.";
    if (!done.has("comment")) e.comment = "Head to the post and comment first.";
    if (!commentLink.trim()) e.commentLink = "Paste your comment link with 2 frens tagged.";
    if (!wallet.trim()) e.wallet = "Enter your EVM wallet address.";
    else if (!/^0x[a-fA-F0-9]{40}$/.test(wallet.trim())) e.wallet = "Invalid address — must be 0x + 40 hex chars.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);

    try {
      const { error } = await supabase.from("applications").insert({
        x_username: xUsername.trim().replace(/^@/, ""),
        quote_link: quoteLink.trim(),
        comment_link: commentLink.trim(),
        wallet: wallet.trim().toLowerCase(),
        follow_done: done.has("follow"),
        like_quote_done: done.has("likeQuote"),
        comment_done: done.has("comment"),
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      setErrors({ submit: err.message || "Something went wrong. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <SuccessScreen wallet={wallet} xUsername={xUsername} />;

  return (
    <div style={{ background: "#040404", minHeight: "100vh", color: "#fff", overflowX: "hidden", fontFamily: "'Space Grotesk', sans-serif" }}>
      <Particles />

      {/* Scanlines */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 6px)" }} />

      {/* Glow */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 70% 45% at 50% 15%, rgba(15,50,25,0.22) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Top bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent 0%, ${ACCENT} 40%, ${ACCENT} 60%, transparent 100%)`, zIndex: 50 }} />

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 32px",
        borderBottom: "1px solid rgba(212,175,55,0.07)",
        background: "rgba(4,4,4,0.92)", backdropFilter: "blur(20px)",
      }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 13, letterSpacing: "0.45em", color: ACCENT }}>
          FUXEL
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.8)", animation: "blink 2s ease infinite" }} />
          <span style={{ fontSize: 9, color: "rgba(212,175,55,0.4)", fontFamily: "'Space Grotesk', monospace", letterSpacing: "0.35em", textTransform: "uppercase" }}>
            Applications Open
          </span>
        </div>
      </nav>

      {/* Main */}
      <main style={{ position: "relative", zIndex: 2, maxWidth: 640, margin: "0 auto", padding: "120px 24px 80px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.7em", color: "rgba(212,175,55,0.3)", fontFamily: "'Space Grotesk', monospace", textTransform: "uppercase", marginBottom: 20 }}>
            FUXEL NFT · 1,555 FOXES · ETHEREUM
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 900,
            fontSize: "clamp(52px, 14vw, 100px)",
            letterSpacing: "-0.02em", lineHeight: 0.9,
            color: ACCENT,
            textShadow: "0 0 80px rgba(212,175,55,0.2), 0 0 160px rgba(212,175,55,0.08)",
            marginBottom: 16,
          }}>
            {headline}
          </h1>
          <div style={{ width: 80, height: 1, background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`, margin: "0 auto 20px" }} />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Space Grotesk', monospace", lineHeight: 1.9, maxWidth: 380, margin: "0 auto" }}>
            Complete the 4 rituals. Earn your spot.<br />
            The house picks its foxes carefully.
          </p>
        </div>

        {/* Progress ring + counter */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 48 }}>
          <div style={{ position: "relative", width: 130, height: 130 }}>
            <ProgressRing progress={completedCount} total={totalTasks} />
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 900, fontSize: 26, color: ACCENT, lineHeight: 1 }}>
                {completedCount}
              </span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "'Space Grotesk', monospace", letterSpacing: "0.3em" }}>
                / {totalTasks}
              </span>
            </div>
          </div>
          <div style={{ fontSize: 9, color: "rgba(212,175,55,0.3)", fontFamily: "'Space Grotesk', monospace", letterSpacing: "0.4em", textTransform: "uppercase", marginTop: 12 }}>
            {completedCount === totalTasks ? "All tasks complete" : `${totalTasks - completedCount} remaining`}
          </div>
        </div>

        {/* Divider label */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.08)" }} />
          <span style={{ fontSize: 8, letterSpacing: "0.5em", color: "rgba(212,175,55,0.25)", fontFamily: "'Space Grotesk', monospace", textTransform: "uppercase" }}>
            Rituals
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.08)" }} />
        </div>

        {/* Tasks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>

          {/* Task 1 — X Username */}
          <div style={{
            background: "rgba(8,8,8,0.7)", border: "1px solid rgba(255,255,255,0.055)",
            padding: "22px 24px", backdropFilter: "blur(8px)",
            borderColor: xUsername.trim() ? "rgba(212,175,55,0.22)" : "rgba(255,255,255,0.055)",
            transition: "border-color 0.3s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, flexShrink: 0, border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 11,
                color: xUsername.trim() ? ACCENT : "rgba(255,255,255,0.2)",
                background: xUsername.trim() ? "rgba(212,175,55,0.07)" : "transparent",
                borderColor: xUsername.trim() ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.08)",
                transition: "all 0.3s",
              }}>
                {xUsername.trim() ? <Check /> : "01"}
              </div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: xUsername.trim() ? ACCENT : "rgba(255,255,255,0.8)", letterSpacing: "0.03em", transition: "color 0.3s" }}>
                  Drop your X username
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', monospace", marginTop: 2 }}>
                  So we know who you are
                </div>
              </div>
            </div>
            <input
              value={xUsername}
              onChange={e => { setXUsername(e.target.value); setErrors(v => ({ ...v, xUsername: "" })); }}
              placeholder="@yourhandle"
              style={{
                width: "100%", background: "rgba(0,0,0,0.6)",
                border: `1px solid ${errors.xUsername ? "rgba(239,68,68,0.45)" : "rgba(212,175,55,0.12)"}`,
                color: "#fff", fontFamily: "'Space Grotesk', monospace", fontSize: 13,
                padding: "13px 16px", outline: "none", boxSizing: "border-box",
                letterSpacing: "0.02em",
              }}
            />
            {errors.xUsername && <p style={{ color: "#ef4444", fontSize: 10, fontFamily: "'Space Grotesk', monospace", marginTop: 6 }}>{errors.xUsername}</p>}
          </div>

          {/* Task 2 — Follow */}
          <StepCard
            num="02" label="Follow @FuxelNFT on X"
            sub="Hit follow — join the den"
            done={done.has("follow")} loading={loading === "follow"}
            actionLabel="Follow →"
            onAction={() => openAndMark("follow", "https://x.com/FuxelNFT")}
          >
            {errors.follow && <p style={{ color: "#ef4444", fontSize: 10, fontFamily: "'Space Grotesk', monospace", marginTop: 5 }}>{errors.follow}</p>}
          </StepCard>

          {/* Task 3 — Like & Quote */}
          <div style={{
            background: done.has("likeQuote") ? "rgba(212,175,55,0.04)" : "rgba(8,8,8,0.7)",
            border: `1px solid ${done.has("likeQuote") ? "rgba(212,175,55,0.22)" : "rgba(255,255,255,0.055)"}`,
            padding: "22px 24px", backdropFilter: "blur(8px)", transition: "all 0.35s ease",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flex: 1 }}>
                <div style={{
                  width: 32, height: 32, flexShrink: 0,
                  border: `1px solid ${done.has("likeQuote") ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.08)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 11,
                  color: done.has("likeQuote") ? ACCENT : "rgba(255,255,255,0.2)",
                  background: done.has("likeQuote") ? "rgba(212,175,55,0.07)" : "transparent",
                  transition: "all 0.3s",
                }}>
                  {done.has("likeQuote") ? <Check /> : "03"}
                </div>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: done.has("likeQuote") ? ACCENT : "rgba(255,255,255,0.8)", letterSpacing: "0.03em", transition: "color 0.3s" }}>
                    Like and quote the post
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', monospace", marginTop: 2 }}>
                    Like it · Quote it with your thoughts
                  </div>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {done.has("likeQuote") ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", border: "1px solid rgba(212,175,55,0.2)", background: "rgba(212,175,55,0.06)", fontSize: 9, fontFamily: "'Space Grotesk', monospace", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: ACCENT }}>
                    <Check /> DONE
                  </div>
                ) : (
                  <button
                    onClick={() => openAndMark("likeQuote", POST_URL)}
                    disabled={loading === "likeQuote"}
                    style={{ padding: "8px 18px", background: "linear-gradient(135deg, rgba(139,0,0,0.75), rgba(80,0,0,0.75))", border: "1px solid rgba(212,175,55,0.2)", color: ACCENT, fontFamily: "'Space Grotesk', monospace", fontWeight: 700, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}>
                    VIEW POST →
                  </button>
                )}
              </div>
            </div>
            <input
              value={quoteLink}
              onChange={e => { setQuoteLink(e.target.value); setErrors(v => ({ ...v, quoteLink: "" })); }}
              placeholder="Paste your quote tweet link"
              style={{ width: "100%", background: "rgba(0,0,0,0.6)", border: `1px solid ${errors.quoteLink ? "rgba(239,68,68,0.45)" : "rgba(212,175,55,0.12)"}`, color: "#fff", fontFamily: "'Space Grotesk', monospace", fontSize: 12, padding: "12px 16px", outline: "none", boxSizing: "border-box" }}
            />
            {errors.quoteLink && <p style={{ color: "#ef4444", fontSize: 10, fontFamily: "'Space Grotesk', monospace", marginTop: 6 }}>{errors.quoteLink}</p>}
          </div>

          {/* Task 4 — Comment & tag 2 frens */}
          <div style={{
            background: done.has("comment") ? "rgba(212,175,55,0.04)" : "rgba(8,8,8,0.7)",
            border: `1px solid ${done.has("comment") ? "rgba(212,175,55,0.22)" : "rgba(255,255,255,0.055)"}`,
            padding: "22px 24px", backdropFilter: "blur(8px)", transition: "all 0.35s ease",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flex: 1 }}>
                <div style={{
                  width: 32, height: 32, flexShrink: 0,
                  border: `1px solid ${done.has("comment") ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.08)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 11,
                  color: done.has("comment") ? ACCENT : "rgba(255,255,255,0.2)",
                  background: done.has("comment") ? "rgba(212,175,55,0.07)" : "transparent",
                  transition: "all 0.3s",
                }}>
                  {done.has("comment") ? <Check /> : "04"}
                </div>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: done.has("comment") ? ACCENT : "rgba(255,255,255,0.8)", letterSpacing: "0.03em", transition: "color 0.3s" }}>
                    Comment and tag 2 frens
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', monospace", marginTop: 2 }}>
                    Comment on the post · mention 2 people
                  </div>
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {done.has("comment") ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", border: "1px solid rgba(212,175,55,0.2)", background: "rgba(212,175,55,0.06)", fontSize: 9, fontFamily: "'Space Grotesk', monospace", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: ACCENT }}>
                    <Check /> DONE
                  </div>
                ) : (
                  <button
                    onClick={() => openAndMark("comment", POST_URL)}
                    disabled={loading === "comment"}
                    style={{ padding: "8px 18px", background: "linear-gradient(135deg, rgba(139,0,0,0.75), rgba(80,0,0,0.75))", border: "1px solid rgba(212,175,55,0.2)", color: ACCENT, fontFamily: "'Space Grotesk', monospace", fontWeight: 700, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}>
                    GO COMMENT →
                  </button>
                )}
              </div>
            </div>
            <input
              value={commentLink}
              onChange={e => { setCommentLink(e.target.value); setErrors(v => ({ ...v, commentLink: "" })); }}
              placeholder="Paste your comment link (with 2 frens tagged)"
              style={{ width: "100%", background: "rgba(0,0,0,0.6)", border: `1px solid ${errors.commentLink ? "rgba(239,68,68,0.45)" : "rgba(212,175,55,0.12)"}`, color: "#fff", fontFamily: "'Space Grotesk', monospace", fontSize: 12, padding: "12px 16px", outline: "none", boxSizing: "border-box" }}
            />
            {errors.commentLink && <p style={{ color: "#ef4444", fontSize: 10, fontFamily: "'Space Grotesk', monospace", marginTop: 6 }}>{errors.commentLink}</p>}
          </div>
        </div>

        {/* Divider label */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.08)" }} />
          <span style={{ fontSize: 8, letterSpacing: "0.5em", color: "rgba(212,175,55,0.25)", fontFamily: "'Space Grotesk', monospace", textTransform: "uppercase" }}>
            Claim
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.08)" }} />
        </div>

        {/* Wallet section */}
        <div style={{
          border: "1px solid rgba(212,175,55,0.12)",
          background: "rgba(8,8,8,0.8)", padding: "28px 24px",
          backdropFilter: "blur(12px)", marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <span style={{ fontSize: 22, color: ACCENT, lineHeight: 1 }}>◈</span>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                Submit EVM Wallet
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", fontFamily: "'Space Grotesk', monospace", marginTop: 2 }}>
                This is where your Fox lands.
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(212,175,55,0.06)", marginBottom: 18 }} />
          <input
            value={wallet}
            onChange={e => { setWallet(e.target.value); setErrors(v => ({ ...v, wallet: "" })); }}
            placeholder="0x..."
            style={{
              width: "100%", background: "rgba(0,0,0,0.7)",
              border: `1px solid ${errors.wallet ? "rgba(239,68,68,0.45)" : "rgba(212,175,55,0.15)"}`,
              color: "#fff", fontFamily: "'Space Grotesk', monospace", fontSize: 13,
              padding: "14px 16px", outline: "none", boxSizing: "border-box", letterSpacing: "0.03em",
            }}
          />
          {errors.wallet && <p style={{ color: "#ef4444", fontSize: 10, fontFamily: "'Space Grotesk', monospace", marginTop: 6 }}>{errors.wallet}</p>}
        </div>

        {/* Submit error */}
        {errors.submit && (
          <p style={{ color: "#ef4444", fontSize: 11, fontFamily: "'Space Grotesk', monospace", textAlign: "center", marginBottom: 12 }}>{errors.submit}</p>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: "100%", padding: "18px",
            background: submitting ? "rgba(50,10,10,0.7)" : "linear-gradient(135deg, #8B0000 0%, #5a0000 100%)",
            border: "1px solid rgba(212,175,55,0.3)",
            color: ACCENT, fontFamily: "'Syne', sans-serif", fontWeight: 900,
            fontSize: 12, letterSpacing: "0.4em", textTransform: "uppercase",
            cursor: submitting ? "wait" : "pointer",
            transition: "all 0.3s", boxSizing: "border-box",
            boxShadow: submitting ? "none" : "0 0 30px rgba(139,0,0,0.3)",
          }}
          onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 50px rgba(139,0,0,0.5)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(139,0,0,0.3)"; }}
        >
          {submitting ? "Securing your spot···" : "Secure My Whitelist Spot →"}
        </button>

        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.1)", fontFamily: "'Space Grotesk', monospace", textAlign: "center", marginTop: 12, letterSpacing: "0.15em" }}>
          Double-check your wallet. You won't be asked again.
        </p>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 64, paddingTop: 32, borderTop: "1px solid rgba(212,175,55,0.05)" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "rgba(212,175,55,0.12)", fontFamily: "'Space Grotesk', monospace", textTransform: "uppercase" }}>
            FUXEL · 1,555 Foxes · Ethereum · The house always wins.
          </div>
        </div>
      </main>

      <Style />
    </div>
  );
}

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #040404; }
      input::placeholder { color: rgba(255,255,255,0.1); }
      input { transition: border-color 0.2s ease; }
      input:focus { border-color: rgba(212,175,55,0.3) !important; }
      ::-webkit-scrollbar { width: 4px; background: #000; }
      ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.15); }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
      button:hover:not(:disabled) { filter: brightness(1.08); }
    `}</style>
  );
}
