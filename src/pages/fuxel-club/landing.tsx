import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useClubAuth } from "@/hooks/use-club-auth";

const SYMBOLS = ["♠", "♥", "♦", "♣", "★", "👑", "🃏"];
const MASK_LABELS = ["KING", "JESTER", "QUEEN", "ACE", "JOKER"];

// Countdown target — pulled from Supabase game_stats, fallback 6 days from now
const FALLBACK_END = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);

function useCountdown(target: Date) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return time;
}

export default function ClubLanding() {
  const [, navigate] = useLocation();
  const { isAuthenticated, signInWithX } = useClubAuth();
  const [maskIdx, setMaskIdx] = useState(0);
  const [symbolIdx, setSymbolIdx] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeValid, setCodeValid] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [countdownEnd, setCountdownEnd] = useState(FALLBACK_END);
  const [playerCount, setPlayerCount] = useState(0);
  const time = useCountdown(countdownEnd);

  useEffect(() => {
    // Fetch game stats
    supabase.from("game_stats").select("countdown_ends_at, total_players").single().then(({ data }) => {
      if (data?.countdown_ends_at) setCountdownEnd(new Date(data.countdown_ends_at));
      if (data?.total_players) setPlayerCount(data.total_players);
    });

    // Mask rotation
    const maskInterval = setInterval(() => {
      setMaskIdx(i => (i + 1) % MASK_LABELS.length);
      setSymbolIdx(i => (i + 1) % SYMBOLS.length);
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 1800);

    return () => clearInterval(maskInterval);
  }, []);

  useEffect(() => {
    if (isAuthenticated && codeValid) navigate("/club/home");
  }, [isAuthenticated, codeValid]);

  const checkCode = useCallback(async () => {
    if (!code.trim()) return;
    setCheckingCode(true);
    setCodeError("");

    try {
      const { data, error } = await supabase
        .from("access_codes")
        .select("id, uses_remaining, code")
        .eq("code", code.toUpperCase().trim())
        .single();

      if (error || !data) {
        setCodeError("Invalid code. Try again.");
        return;
      }

      if (data.uses_remaining <= 0) {
        setCodeError("This code has been fully claimed.");
        return;
      }

      // Store code in session for use after X login
      sessionStorage.setItem("fuxel_access_code", data.code);
      setCodeValid(true);
    } catch {
      setCodeError("Something went wrong. Try again.");
    } finally {
      setCheckingCode(false);
    }
  }, [code]);

  const handleProceed = async () => {
    if (!codeValid) {
      await checkCode();
      return;
    }
    await signInWithX();
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col items-center justify-center"
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>

      {/* Felt texture */}
      <div className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse at 50% 50%, #0d3b1e 0%, #000 70%)`,
        }} />

      {/* Gold grid lines */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }} />

      {/* Corner suit decorations */}
      {["top-4 left-6", "top-4 right-6", "bottom-4 left-6", "bottom-4 right-6"].map((pos, i) => (
        <div key={i} className={`fixed ${pos} text-5xl opacity-[0.06] select-none pointer-events-none`}
          style={{ color: i % 2 === 0 ? "#D4AF37" : "#8B0000" }}>
          {["♠", "♥", "♣", "♦"][i]}
        </div>
      ))}

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.8) 3px, rgba(0,0,0,0.8) 4px)" }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <div className="text-xs tracking-[0.4em] text-yellow-600/40 uppercase">fuxel.club</div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-red-400/70 tracking-widest uppercase font-mono">
            {playerCount}/500 seats taken
          </span>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg mx-auto w-full">

        {/* Animated mask */}
        <div className="relative mb-6 select-none">
          <div
            className={`text-[100px] leading-none transition-all duration-150 ${glitch ? "scale-110 -skew-x-3" : "scale-100"}`}
            style={{
              filter: glitch
                ? "drop-shadow(4px 0 #ff0000) drop-shadow(-4px 0 #00ff00)"
                : "drop-shadow(0 0 30px rgba(212,175,55,0.4))",
              transition: "filter 0.15s",
            }}
          >
            {SYMBOLS[symbolIdx]}
          </div>
          <div
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.5em] uppercase font-mono transition-all duration-200 ${glitch ? "text-red-400" : "text-yellow-600/60"}`}
          >
            {MASK_LABELS[maskIdx]}
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-3 mb-8">
          {[
            { val: time.d, label: "days" },
            { val: time.h, label: "hrs" },
            { val: time.m, label: "min" },
            { val: time.s, label: "sec" },
          ].map((t, i) => (
            <div key={t.label} className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-3xl font-black tabular-nums"
                  style={{ color: "#D4AF37", textShadow: "0 0 20px rgba(212,175,55,0.5)", fontFamily: "Georgia, serif" }}>
                  {pad(t.val)}
                </div>
                <div className="text-[9px] text-gray-600 uppercase tracking-widest font-mono">{t.label}</div>
              </div>
              {i < 3 && <div className="text-yellow-600/40 font-black text-2xl mb-3">:</div>}
            </div>
          ))}
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl font-black leading-tight mb-2 tracking-wide">
          {"May The CaRds Be".split("").map((char, i) => (
            <span key={i} style={{
              color: char === char.toUpperCase() && char !== " " ? "#D4AF37" : "rgba(255,255,255,0.7)",
            }}>{char}</span>
          ))}
          <br />
          {"wItH YoU".split("").map((char, i) => (
            <span key={i} style={{
              color: char === char.toUpperCase() && char !== " " ? "#D4AF37" : "rgba(255,255,255,0.7)",
            }}>{char}</span>
          ))}
        </h1>

        <p className="text-xs text-gray-600 tracking-widest uppercase font-mono mb-10">
          1,555 NFTs · Top 500 Survive · Only the cards decide
        </p>

        {/* Access code input */}
        {!codeValid ? (
          <div className="w-full space-y-3 mb-6">
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setCodeError(""); }}
                onKeyDown={e => e.key === "Enter" && checkCode()}
                placeholder="ENTER ACCESS CODE"
                maxLength={20}
                className="w-full bg-black/60 border border-yellow-600/20 text-white text-center text-sm font-mono tracking-[0.3em] uppercase py-4 px-6 placeholder-gray-700 focus:outline-none focus:border-yellow-600/50 transition-colors"
                style={{ letterSpacing: "0.3em" }}
              />
              {codeError && (
                <p className="text-red-400 text-[11px] font-mono mt-2 tracking-wider">{codeError}</p>
              )}
            </div>

            <button
              onClick={checkCode}
              disabled={checkingCode || !code.trim()}
              className="w-full py-4 font-black uppercase tracking-[0.3em] text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #8B0000, #4a0000)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "#D4AF37",
              }}
            >
              {checkingCode ? "Checking..." : "Verify Code"}
            </button>
          </div>
        ) : (
          <div className="w-full space-y-3 mb-6">
            <div className="border border-green-500/30 bg-green-500/5 py-3 px-4 text-center">
              <span className="text-green-400 text-xs font-mono tracking-widest uppercase">✓ Code Accepted — Login to Enter</span>
            </div>
            <button
              onClick={signInWithX}
              className="w-full py-4 font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #1a1a1a, #000)",
                border: "1px solid rgba(212,175,55,0.4)",
                color: "#D4AF37",
              }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Sign in with X
            </button>
          </div>
        )}

        {/* Live count */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-gray-700">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>{playerCount} / 500 seats claimed</span>
        </div>

      </div>

      {/* Bottom border */}
      <div className="fixed bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" }} />

    </div>
  );
}
