import { useState, useEffect, useRef } from "react";

const SYMBOLS = ["♠", "♥", "♦", "♣", "★", "🃏"];
const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#▓▒░█";

function glitchText(str) {
  return str.split("").map((c, i) =>
    Math.random() > 0.7 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : c
  ).join("");
}

function GlitchTitle({ text, className, style }) {
  const [display, setDisplay] = useState(text);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        setActive(true);
        let count = 0;
        const flicker = setInterval(() => {
          setDisplay(glitchText(text));
          count++;
          if (count > 4) {
            clearInterval(flicker);
            setDisplay(text);
            setActive(false);
          }
        }, 60);
      }
    }, 2200);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={className} style={{ ...style, filter: active ? "drop-shadow(3px 0 #ff0040) drop-shadow(-3px 0 #00ffff)" : "none", transition: "filter 0.08s" }}>
      {display}
    </span>
  );
}

function CountdownUnit({ val, label }) {
  return (
    <div className="flex flex-col items-center">
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: "clamp(28px, 7vw, 52px)",
        fontWeight: 900,
        color: "#D4AF37",
        textShadow: "0 0 20px rgba(212,175,55,0.6)",
        lineHeight: 1,
        minWidth: "2ch",
        textAlign: "center",
      }}>
        {String(val).padStart(2, "0")}
      </div>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(212,175,55,0.35)", fontFamily: "monospace", marginTop: 4, textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

function ScanlineOverlay() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1,
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)",
    }} />
  );
}

function NoiseTexture() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, opacity: 0.04,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundSize: "128px",
    }} />
  );
}

const TRAIT_ROWS = [
  { label: "Background", count: "18 variants" },
  { label: "Body", count: "12 variants" },
  { label: "Eyes", count: "24 variants" },
  { label: "Mouth", count: "16 variants" },
  { label: "Headwear", count: "31 variants" },
  { label: "Accessories", count: "27 variants" },
  { label: "Aura", count: "9 variants" },
];

export default function ClubLanding() {
  const [step, setStep] = useState("landing"); // landing | code | error
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [checking, setChecking] = useState(false);
  const [symbolIdx, setSymbolIdx] = useState(0);
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [playerCount] = useState(312);
  const inputRef = useRef(null);

  // Rotating symbol
  useEffect(() => {
    const id = setInterval(() => setSymbolIdx(i => (i + 1) % SYMBOLS.length), 1800);
    return () => clearInterval(id);
  }, []);

  // Countdown to a fixed date
  useEffect(() => {
    const target = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleCode = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setChecking(true);
    setCodeError("");
    // Simulate check — replace with real supabase call
    await new Promise(r => setTimeout(r, 900));
    if (trimmed === "FUXEL-DEMO" || trimmed.startsWith("FUXEL-")) {
      setStep("whitelist");
      window.location.hash = "whitelist";
    } else {
      setCodeError("Invalid or expired code. Get one from an existing member.");
    }
    setChecking(false);
  };

  const accent = "#D4AF37";
  const bg = "#050505";

  return (
    <div style={{ background: bg, minHeight: "100vh", color: "#fff", fontFamily: "'Georgia', serif", overflowX: "hidden" }}>
      <ScanlineOverlay />
      <NoiseTexture />

      {/* Felt radial bg */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(13,59,30,0.25) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Top gold line */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, zIndex: 50 }} />

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 28px",
        borderBottom: "1px solid rgba(212,175,55,0.08)",
        background: "rgba(5,5,5,0.85)",
        backdropFilter: "blur(16px)",
      }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 13, letterSpacing: "0.4em", color: accent }}>
          FUXEL.CLUB
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px rgba(239,68,68,0.7)", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 10, color: "rgba(212,175,55,0.4)", fontFamily: "monospace", letterSpacing: "0.3em", textTransform: "uppercase" }}>
            {playerCount} / 500 seated
          </span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px", textAlign: "center" }}>

        {/* Rotating suit */}
        <div style={{
          fontSize: 72, color: accent, marginBottom: 24,
          textShadow: "0 0 60px rgba(212,175,55,0.5)",
          transition: "all 0.3s",
          userSelect: "none",
        }}>
          {SYMBOLS[symbolIdx]}
        </div>

        <div style={{ fontSize: 10, letterSpacing: "0.6em", color: "rgba(212,175,55,0.3)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 16 }}>
          Hand Drawn · Ethereum · 1,555 Supply
        </div>

        <h1 style={{
          fontFamily: "Georgia, serif",
          fontSize: "clamp(72px, 18vw, 140px)",
          fontWeight: 900,
          lineHeight: 0.88,
          margin: "0 0 8px",
          letterSpacing: "-0.02em",
        }}>
          <GlitchTitle text="FUXEL" style={{ color: "#ffffff", display: "block", textShadow: "0 0 80px rgba(212,175,55,0.15)" }} />
        </h1>

        <h2 style={{
          fontFamily: "Georgia, serif",
          fontSize: "clamp(36px, 9vw, 70px)",
          fontWeight: 900,
          color: accent,
          lineHeight: 1,
          margin: "0 0 28px",
          textShadow: `0 0 40px rgba(212,175,55,0.5)`,
          letterSpacing: "0.05em",
        }}>
          CLUB
        </h2>

        <div style={{ width: 120, height: 1, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, margin: "0 auto 32px" }} />

        <p style={{ maxWidth: 480, fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, fontFamily: "Georgia, serif", marginBottom: 48, fontStyle: "italic" }}>
          A hand-drawn NFT collection of 1,555 Foxes on Ethereum. Each one a different interpretation of self — form, instinct, and expression.
        </p>

        {/* Countdown */}
        <div style={{
          border: "1px solid rgba(212,175,55,0.2)",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(12px)",
          padding: "28px 40px",
          marginBottom: 48,
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 0 60px rgba(212,175,55,0.08), inset 0 0 30px rgba(212,175,55,0.03)",
        }}>
          <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "rgba(212,175,55,0.4)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 20 }}>
            Table Opens In
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <CountdownUnit val={countdown.d} label="days" />
            <div style={{ color: "rgba(212,175,55,0.3)", fontSize: 32, fontWeight: 900, marginBottom: 16 }}>:</div>
            <CountdownUnit val={countdown.h} label="hrs" />
            <div style={{ color: "rgba(212,175,55,0.3)", fontSize: 32, fontWeight: 900, marginBottom: 16 }}>:</div>
            <CountdownUnit val={countdown.m} label="min" />
            <div style={{ color: "rgba(212,175,55,0.3)", fontSize: 32, fontWeight: 900, marginBottom: 16 }}>:</div>
            <CountdownUnit val={countdown.s} label="sec" />
          </div>
        </div>

        {/* Access code */}
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "rgba(212,175,55,0.3)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 12 }}>
            Have an Access Code?
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            <input
              ref={inputRef}
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setCodeError(""); }}
              onKeyDown={e => e.key === "Enter" && handleCode()}
              placeholder="FUXEL-XXXXXX"
              maxLength={20}
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.7)",
                border: `1px solid ${codeError ? "rgba(239,68,68,0.5)" : "rgba(212,175,55,0.2)"}`,
                borderRight: "none",
                color: "#fff",
                fontFamily: "'Courier New', monospace",
                fontSize: 13,
                letterSpacing: "0.25em",
                padding: "14px 16px",
                outline: "none",
                textTransform: "uppercase",
              }}
            />
            <button
              onClick={handleCode}
              disabled={checking || !code.trim()}
              style={{
                background: checking ? "rgba(139,0,0,0.3)" : "linear-gradient(135deg, #8B0000, #5a0000)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: accent,
                fontFamily: "'Courier New', monospace",
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                padding: "14px 20px",
                cursor: checking ? "wait" : "pointer",
                opacity: !code.trim() ? 0.4 : 1,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {checking ? "..." : "ENTER"}
            </button>
          </div>
          {codeError && (
            <p style={{ color: "#ef4444", fontSize: 11, fontFamily: "monospace", marginTop: 8, textAlign: "center" }}>{codeError}</p>
          )}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginTop: 10, letterSpacing: "0.1em" }}>
            No code? Get one from an existing member.
          </p>
        </div>

        {/* Scroll cue */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.3 }}>
          <div style={{ width: 1, height: 40, background: `linear-gradient(180deg, transparent, ${accent})` }} />
          <span style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "0.4em", textTransform: "uppercase", color: accent }}>scroll</span>
        </div>
      </section>

      {/* ── COLLECTION SECTION ── */}
      <section style={{ position: "relative", zIndex: 2, padding: "80px 24px", maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, marginBottom: 80 }}>
          {[
            { label: "Total Supply", value: "1,555", sub: "NFTs on Ethereum" },
            { label: "1 / 1 Pieces", value: "80", sub: "Fully unique Foxes" },
            { label: "Mint Price", value: "0.001", sub: "ETH per Fox" },
            { label: "Network", value: "ETH", sub: "Mainnet · OpenSea" },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{
              background: "rgba(212,175,55,0.03)",
              border: "1px solid rgba(212,175,55,0.1)",
              padding: "32px 28px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(212,175,55,0.4)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 12 }}>{label}</div>
              <div style={{ fontSize: "clamp(32px, 7vw, 52px)", fontWeight: 900, color: accent, fontFamily: "Georgia, serif", lineHeight: 1, textShadow: "0 0 30px rgba(212,175,55,0.3)" }}>{value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", marginTop: 8 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 60 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.1)" }} />
          <span style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(212,175,55,0.3)", fontFamily: "monospace", textTransform: "uppercase" }}>The Collection</span>
          <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.1)" }} />
        </div>

        {/* About text */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 48, marginBottom: 80 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(212,175,55,0.4)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 16 }}>The Identity</div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.9, fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              The Foxes exist as interpretations of self. Each one is different, yet none are entirely separate. They reflect variations of what a being can become when stripped down to form, instinct, and expression.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(212,175,55,0.4)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 16 }}>The Assembly</div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.9, fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              Fully hand-assembled trait system. No generative shortcuts — every layer drawn, composed, and placed with intention. No two Foxes are identical. Each carries its own interpretation of the FUXEL identity system.
            </p>
          </div>
        </div>

        {/* Traits */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(212,175,55,0.4)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 24 }}>Trait Layers</div>
          <div style={{ display: "grid", gap: 1 }}>
            {TRAIT_ROWS.map(({ label, count }, i) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px",
                background: i % 2 === 0 ? "rgba(212,175,55,0.02)" : "transparent",
                border: "1px solid rgba(212,175,55,0.06)",
              }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "Georgia, serif" }}>{label}</span>
                <span style={{ fontSize: 11, color: "rgba(212,175,55,0.5)", fontFamily: "monospace" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mint info */}
        <div style={{ border: "1px solid rgba(212,175,55,0.15)", background: "rgba(212,175,55,0.03)", padding: "40px 36px", textAlign: "center", marginBottom: 80, boxShadow: "0 0 80px rgba(212,175,55,0.05)" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(212,175,55,0.4)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 20 }}>Mint Information</div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40 }}>
            {[
              ["Network", "Ethereum Mainnet"],
              ["Supply", "1,555 NFTs"],
              ["1/1s", "80 unique pieces"],
              ["Price", "0.001 ETH"],
              ["Marketplace", "OpenSea"],
            ].map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "rgba(212,175,55,0.3)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 6 }}>{k}</div>
                <div style={{ fontSize: 15, color: "#fff", fontFamily: "Georgia, serif", fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Two paths */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(212,175,55,0.4)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 12 }}>Two Paths</div>
            <div style={{ fontSize: "clamp(22px, 5vw, 34px)", fontWeight: 900, color: "#fff", fontFamily: "Georgia, serif" }}>
              Only the cards decide.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { suit: "♠", title: "Survive", desc: "Top 500 holders keep their Fox. The leaderboard is the only truth." },
              { suit: "♥", title: "Ascend", desc: "Play the shuffle. Build your hand. The table rewards those who understand the game." },
            ].map(({ suit, title, desc }) => (
              <div key={title} style={{
                border: "1px solid rgba(212,175,55,0.12)",
                background: "rgba(0,0,0,0.6)",
                padding: "32px 28px",
              }}>
                <div style={{ fontSize: 40, color: accent, marginBottom: 16, lineHeight: 1 }}>{suit}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "Georgia, serif", marginBottom: 10 }}>{title}</div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, fontFamily: "monospace" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom code CTA */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(212,175,55,0.3)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 24 }}>
            Claim Your Seat
          </div>
          <div style={{ display: "flex", justifyContent: "center", maxWidth: 400, margin: "0 auto", gap: 0 }}>
            <input
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setCodeError(""); }}
              onKeyDown={e => e.key === "Enter" && handleCode()}
              placeholder="FUXEL-XXXXXX"
              maxLength={20}
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.7)",
                border: `1px solid ${codeError ? "rgba(239,68,68,0.5)" : "rgba(212,175,55,0.2)"}`,
                borderRight: "none",
                color: "#fff",
                fontFamily: "'Courier New', monospace",
                fontSize: 13,
                letterSpacing: "0.25em",
                padding: "14px 16px",
                outline: "none",
                textTransform: "uppercase",
              }}
            />
            <button
              onClick={handleCode}
              disabled={checking || !code.trim()}
              style={{
                background: "linear-gradient(135deg, #8B0000, #5a0000)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: accent,
                fontFamily: "'Courier New', monospace",
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                padding: "14px 20px",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {checking ? "..." : "ENTER"}
            </button>
          </div>
          {codeError && (
            <p style={{ color: "#ef4444", fontSize: 11, fontFamily: "monospace", marginTop: 8 }}>{codeError}</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 2, borderTop: "1px solid rgba(212,175,55,0.08)", padding: "28px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "rgba(212,175,55,0.2)", fontFamily: "monospace", textTransform: "uppercase" }}>
          FUXEL · 1,555 Foxes · Ethereum · The house always wins.
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.15); }
        ::-webkit-scrollbar { width: 4px; background: #000; }
        ::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); }
      `}</style>
    </div>
  );
}
