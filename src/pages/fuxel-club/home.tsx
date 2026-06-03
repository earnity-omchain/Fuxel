import { useState, useEffect } from "react";

const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#▓░";

function glitchText(str) {
  return str.split("").map(c =>
    Math.random() > 0.65 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : c
  ).join("");
}

function useGlitch(text, interval = 2600) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.7) {
        let count = 0;
        const flicker = setInterval(() => {
          setDisplay(glitchText(text));
          count++;
          if (count > 5) { clearInterval(flicker); setDisplay(text); }
        }, 55);
      }
    }, interval);
    return () => clearInterval(id);
  }, [text, interval]);
  return display;
}

const TASKS = [
  {
    id: "follow",
    icon: "👤",
    label: "Follow FUXEL",
    description: "Follow @FuxelNFT on X",
    chips: 250,
    actionLabel: "Follow",
    url: "https://x.com/FuxelNFT",
  },
  {
    id: "like",
    icon: "♥",
    label: "Like the Post",
    description: "Like the pinned announcement",
    chips: 250,
    actionLabel: "Like",
    url: "https://x.com/FuxelNFT",
  },
  {
    id: "retweet",
    icon: "🔁",
    label: "Retweet / Quote",
    description: "RT or quote the post to spread the word",
    chips: 250,
    actionLabel: "Retweet",
    url: "https://x.com/FuxelNFT",
  },
  {
    id: "comment",
    icon: "💬",
    label: "Drop a Comment",
    description: "Comment on the announcement post",
    chips: 250,
    actionLabel: "Comment",
    url: "https://x.com/FuxelNFT",
  },
];

function ScanlineOverlay() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
    }} />
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ClubHome() {
  const title = useGlitch("WHITELIST");
  const [completed, setCompleted] = useState(new Set());
  const [wallet, setWallet] = useState("");
  const [walletError, setWalletError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [claimingTask, setClaimingTask] = useState(null);

  const chipsEarned = [...completed].length * 250;
  const allTasksDone = TASKS.every(t => completed.has(t.id));

  const handleTask = async (task) => {
    if (completed.has(task.id)) return;
    window.open(task.url, "_blank", "noopener,noreferrer");
    setClaimingTask(task.id);
    await new Promise(r => setTimeout(r, 1200));
    setCompleted(prev => new Set([...prev, task.id]));
    setClaimingTask(null);
  };

  const handleSubmit = async () => {
    if (!wallet.trim()) { setWalletError("Enter your EVM wallet address."); return; }
    if (!wallet.trim().startsWith("0x") || wallet.trim().length < 40) {
      setWalletError("Invalid wallet address — must start with 0x.");
      return;
    }
    if (!allTasksDone) { setWalletError("Complete all 4 tasks first."); return; }
    setSubmitting(true);
    setWalletError("");
    await new Promise(r => setTimeout(r, 1400));
    setSubmitted(true);
    setSubmitting(false);
  };

  const accent = "#D4AF37";
  const bg = "#050505";

  if (submitted) {
    return (
      <div style={{ background: bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Georgia, serif", textAlign: "center", padding: 24 }}>
        <ScanlineOverlay />
        <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(13,59,30,0.3) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontSize: 64, marginBottom: 24, filter: "drop-shadow(0 0 30px rgba(212,175,55,0.5))" }}>♦</div>
          <div style={{ fontSize: 9, letterSpacing: "0.6em", color: "rgba(212,175,55,0.4)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 16 }}>Application Received</div>
          <h2 style={{ fontSize: "clamp(32px, 8vw, 56px)", fontWeight: 900, color: accent, fontFamily: "Georgia, serif", marginBottom: 16, textShadow: "0 0 40px rgba(212,175,55,0.4)" }}>
            Seat Secured.
          </h2>
          <div style={{ width: 80, height: 1, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, margin: "0 auto 24px" }} />
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", lineHeight: 1.8, maxWidth: 380, margin: "0 auto 40px" }}>
            Your wallet has been logged.<br />
            The house is watching.<br />
            See you at the table.
          </p>
          <div style={{
            border: "1px solid rgba(212,175,55,0.15)",
            background: "rgba(212,175,55,0.04)",
            padding: "20px 28px",
            fontFamily: "monospace",
            fontSize: 12,
            color: "rgba(212,175,55,0.6)",
            letterSpacing: "0.05em",
            wordBreak: "break-all",
            maxWidth: 380,
            margin: "0 auto",
          }}>
            {wallet}
          </div>
        </div>
        <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; background: #000; } ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: bg, minHeight: "100vh", color: "#fff", fontFamily: "Georgia, serif", overflowX: "hidden" }}>
      <ScanlineOverlay />

      {/* Felt glow */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(13,59,30,0.2) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Top gold line */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, zIndex: 50 }} />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 28px",
        borderBottom: "1px solid rgba(212,175,55,0.08)",
        background: "rgba(5,5,5,0.9)",
        backdropFilter: "blur(16px)",
      }}>
        <a href="/" style={{ fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 13, letterSpacing: "0.4em", color: accent, textDecoration: "none" }}>
          FUXEL.CLUB
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.7)", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 10, color: "rgba(212,175,55,0.4)", fontFamily: "monospace", letterSpacing: "0.3em", textTransform: "uppercase" }}>
            Applications Open
          </span>
        </div>
      </nav>

      {/* MAIN */}
      <main style={{ position: "relative", zIndex: 2, maxWidth: 560, margin: "0 auto", padding: "100px 24px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.6em", color: "rgba(212,175,55,0.3)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 16 }}>
            FUXEL Club · Whitelist
          </div>
          <h1 style={{
            fontSize: "clamp(48px, 12vw, 84px)",
            fontWeight: 900,
            color: accent,
            fontFamily: "Georgia, serif",
            lineHeight: 0.9,
            marginBottom: 20,
            textShadow: "0 0 60px rgba(212,175,55,0.3)",
            letterSpacing: "-0.01em",
          }}>
            {title}
          </h1>
          <div style={{ width: 80, height: 1, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, margin: "0 auto 24px" }} />
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", lineHeight: 1.8 }}>
            Complete all tasks to secure your whitelist spot.<br />
            Each action earns chips. Chips determine your standing.
          </p>
        </div>

        {/* Chips progress */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          border: "1px solid rgba(212,175,55,0.12)",
          background: "rgba(212,175,55,0.03)",
          padding: "16px 20px",
          marginBottom: 4,
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(212,175,55,0.4)", fontFamily: "monospace", textTransform: "uppercase" }}>
            Chips Earned
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: accent, fontFamily: "'Courier New', monospace", textShadow: "0 0 20px rgba(212,175,55,0.4)" }}>
              {chipsEarned.toLocaleString()}
            </span>
            <span style={{ fontSize: 11, color: "rgba(212,175,55,0.3)", fontFamily: "monospace" }}>/ 1,000</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: "rgba(212,175,55,0.08)", marginBottom: 32, position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: 0, left: 0, bottom: 0,
            width: `${(chipsEarned / 1000) * 100}%`,
            background: `linear-gradient(90deg, rgba(212,175,55,0.6), ${accent})`,
            transition: "width 0.6s ease",
            boxShadow: `0 0 8px rgba(212,175,55,0.5)`,
          }} />
        </div>

        {/* Tasks */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "rgba(212,175,55,0.3)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 16 }}>
            Required Actions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {TASKS.map((task, i) => {
              const done = completed.has(task.id);
              const claiming = claimingTask === task.id;
              return (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 20px",
                  background: done ? "rgba(212,175,55,0.04)" : "rgba(0,0,0,0.5)",
                  border: `1px solid ${done ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.05)"}`,
                  transition: "all 0.3s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{
                      fontSize: task.icon === "♥" ? 18 : 16,
                      color: done ? accent : "rgba(255,255,255,0.25)",
                      width: 22, textAlign: "center",
                      transition: "color 0.3s",
                    }}>{task.icon}</span>
                    <div>
                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: done ? accent : "rgba(255,255,255,0.75)",
                        fontFamily: "Georgia, serif",
                        letterSpacing: "0.02em",
                        transition: "color 0.3s",
                      }}>{task.label}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginTop: 2 }}>{task.description}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: 12 }}>
                    <span style={{
                      fontSize: 10, fontFamily: "monospace", fontWeight: 700,
                      color: done ? accent : "rgba(212,175,55,0.3)",
                      transition: "color 0.3s",
                    }}>+{task.chips}</span>

                    {done ? (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "6px 12px",
                        border: "1px solid rgba(212,175,55,0.25)",
                        background: "rgba(212,175,55,0.07)",
                        fontSize: 9, fontFamily: "monospace", letterSpacing: "0.3em",
                        textTransform: "uppercase", color: accent,
                      }}>
                        <CheckIcon /> Done
                      </div>
                    ) : (
                      <button
                        onClick={() => handleTask(task)}
                        disabled={claiming}
                        style={{
                          padding: "7px 14px",
                          border: "1px solid rgba(212,175,55,0.25)",
                          background: claiming ? "rgba(139,0,0,0.2)" : "linear-gradient(135deg, rgba(139,0,0,0.6), rgba(90,0,0,0.6))",
                          color: accent,
                          fontFamily: "'Courier New', monospace",
                          fontWeight: 900,
                          fontSize: 9,
                          letterSpacing: "0.3em",
                          textTransform: "uppercase",
                          cursor: claiming ? "wait" : "pointer",
                          transition: "all 0.2s",
                          opacity: claiming ? 0.6 : 1,
                        }}
                      >
                        {claiming ? "..." : task.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* All done banner */}
        {allTasksDone && (
          <div style={{
            border: "1px solid rgba(212,175,55,0.3)",
            background: "rgba(212,175,55,0.05)",
            padding: "16px 24px",
            textAlign: "center",
            marginBottom: 32,
            animation: "fadeIn 0.5s ease",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: accent, fontFamily: "Georgia, serif", letterSpacing: "0.05em" }}>
              ♦ All tasks complete — 1,000 chips secured ♦
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", marginTop: 6 }}>
              Submit your wallet below to finalize your application.
            </div>
          </div>
        )}

        {/* Wallet submission */}
        <div style={{
          border: `1px solid ${allTasksDone ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.05)"}`,
          background: allTasksDone ? "rgba(212,175,55,0.03)" : "rgba(0,0,0,0.4)",
          padding: "32px 28px",
          transition: "all 0.4s",
          opacity: allTasksDone ? 1 : 0.5,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 18, color: allTasksDone ? accent : "rgba(255,255,255,0.2)" }}>◈</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: allTasksDone ? "#fff" : "rgba(255,255,255,0.4)", fontFamily: "Georgia, serif" }}>
                Submit EVM Wallet
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginTop: 2 }}>
                This is where your Fox goes if you win.
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(212,175,55,0.06)", margin: "20px 0" }} />

          <input
            value={wallet}
            onChange={e => { setWallet(e.target.value); setWalletError(""); }}
            placeholder="0x..."
            disabled={!allTasksDone}
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.7)",
              border: `1px solid ${walletError ? "rgba(239,68,68,0.5)" : "rgba(212,175,55,0.15)"}`,
              color: "#fff",
              fontFamily: "'Courier New', monospace",
              fontSize: 13,
              padding: "14px 16px",
              outline: "none",
              marginBottom: 12,
              opacity: allTasksDone ? 1 : 0.4,
              cursor: allTasksDone ? "text" : "not-allowed",
              boxSizing: "border-box",
            }}
          />

          {walletError && (
            <p style={{ color: "#ef4444", fontSize: 11, fontFamily: "monospace", marginBottom: 12 }}>{walletError}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!allTasksDone || submitting}
            style={{
              width: "100%",
              padding: "16px",
              background: allTasksDone ? "linear-gradient(135deg, #8B0000, #5a0000)" : "rgba(30,30,30,0.5)",
              border: `1px solid ${allTasksDone ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.05)"}`,
              color: allTasksDone ? accent : "rgba(255,255,255,0.2)",
              fontFamily: "'Courier New', monospace",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              cursor: allTasksDone && !submitting ? "pointer" : "not-allowed",
              transition: "all 0.3s",
              boxSizing: "border-box",
            }}
          >
            {submitting ? "Submitting..." : allTasksDone ? "Secure My Whitelist Spot →" : "Complete All Tasks First"}
          </button>

          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", fontFamily: "monospace", textAlign: "center", marginTop: 12, letterSpacing: "0.1em" }}>
            You won't be asked again. Double-check your address.
          </p>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: "center", marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(212,175,55,0.06)" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "rgba(212,175,55,0.15)", fontFamily: "monospace", textTransform: "uppercase" }}>
            FUXEL · 1,555 Foxes · Ethereum · The house always wins.
          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.12); }
        ::-webkit-scrollbar { width: 4px; background: #000; }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); }
      `}</style>
    </div>
  );
}
