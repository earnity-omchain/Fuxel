import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useClubAuth } from "@/hooks/use-club-auth";

const SYMBOLS = ["♠", "♥", "♦", "♣", "★", "🃏", "👑", "♠", "♥", "♦"];

function useCountdown(target: Date) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0, done: false });

  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTime({ d: 0, h: 0, m: 0, s: 0, done: true });
        return;
      }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        done: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return time;
}

type Step = "code" | "login" | "bind" | "countdown";

export default function ClubLanding() {
  const [, navigate] = useLocation();
  const { authUser, clubUser, loading, signInWithX, refreshUser } = useClubAuth();

  const [step, setStep] = useState<Step>("code");
  const [symbolIdx, setSymbolIdx] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [countdownEnd, setCountdownEnd] = useState(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
  const [playerCount, setPlayerCount] = useState(0);

  // Code step
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  // Bind wallet step
  const [wallet, setWallet] = useState("");
  const [walletError, setWalletError] = useState("");
  const [bindingWallet, setBindingWallet] = useState(false);

  const time = useCountdown(countdownEnd);

  useEffect(() => {
    // Fetch game stats
    supabase.from("game_stats").select("countdown_ends_at, total_players").single().then(({ data }) => {
      if (data?.countdown_ends_at) setCountdownEnd(new Date(data.countdown_ends_at));
      if (data?.total_players) setPlayerCount(data.total_players);
    });

    // Symbol rotation
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
      setSymbolIdx(i => (i + 1) % SYMBOLS.length);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  // Determine step based on auth state
  useEffect(() => {
    if (loading) return;

    if (!authUser) {
      // Check if code was already verified
      const savedCode = sessionStorage.getItem("fuxel_code_verified");
      if (savedCode) setStep("login");
      else setStep("code");
      return;
    }

    if (authUser && !clubUser) {
      setStep("bind");
      return;
    }

    if (authUser && clubUser) {
      if (!clubUser.wallet_address) {
        setStep("bind");
        return;
      }
      if (time.done) {
        navigate("/club/home");
      } else {
        setStep("countdown");
      }
    }
  }, [loading, authUser, clubUser, time.done]);

  // Navigate when countdown finishes
  useEffect(() => {
    if (step === "countdown" && time.done) {
      navigate("/club/home");
    }
  }, [time.done, step]);

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

      if (error || !data) { setCodeError("Invalid code. Try again."); return; }
      if (data.uses_remaining <= 0) { setCodeError("This code is no longer valid."); return; }

      sessionStorage.setItem("fuxel_code_verified", data.code);
      setStep("login");
    } catch {
      setCodeError("Something went wrong. Try again.");
    } finally {
      setCheckingCode(false);
    }
  }, [code]);

  const handleBindWallet = async () => {
    if (!wallet.trim()) { setWalletError("Enter your wallet address."); return; }
    if (!wallet.startsWith("0x") || wallet.length < 40) { setWalletError("Invalid wallet address."); return; }
    if (!authUser) return;

    setBindingWallet(true);
    setWalletError("");

    try {
      const xId = authUser.id;
      const xUsername = authUser.user_metadata?.user_name || authUser.user_metadata?.preferred_username || "unknown";
      const xAvatar = authUser.user_metadata?.avatar_url || "";
      const referralCode = `FUXEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const accessCode = sessionStorage.getItem("fuxel_code_verified") || "";

      // Check if user exists
      const { data: existing } = await supabase
        .from("users")
        .select("id, wallet_address")
        .eq("x_id", xId)
        .single();

      if (existing) {
        // Update wallet
        await supabase.from("users").update({ wallet_address: wallet.trim() }).eq("x_id", xId);
      } else {
        // Create new user
        // Decrement code uses
        await supabase.rpc("use_access_code", { code_text: accessCode });

        await supabase.from("users").insert({
          x_id: xId,
          x_username: xUsername,
          x_avatar: xAvatar,
          chips: 100,
          referral_code: referralCode,
          wallet_address: wallet.trim(),
        });

        // Update total players
        await supabase.rpc("increment_players");
      }

      await refreshUser();
      setStep("countdown");
    } catch (e) {
      setWalletError("Failed to save wallet. Try again.");
    } finally {
      setBindingWallet(false);
    }
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  const containerClass = "min-h-screen bg-black text-white overflow-hidden relative flex flex-col items-center justify-center px-6";
  const feltBg = (
    <>
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, #0d2010 0%, #000 70%)", opacity: 0.8 }} />
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
      <div className="fixed top-4 left-6 text-6xl opacity-[0.04] pointer-events-none select-none" style={{ color: "#D4AF37" }}>♠</div>
      <div className="fixed top-4 right-6 text-6xl opacity-[0.04] pointer-events-none select-none" style={{ color: "#8B0000" }}>♥</div>
      <div className="fixed bottom-4 left-6 text-6xl opacity-[0.04] pointer-events-none select-none" style={{ color: "#D4AF37" }}>♣</div>
      <div className="fixed bottom-4 right-6 text-6xl opacity-[0.04] pointer-events-none select-none" style={{ color: "#8B0000" }}>♦</div>
    </>
  );

  // Animated symbol header — shared across all steps
  const SymbolHeader = () => (
    <div className="mb-8 text-center select-none">
      <div
        className={`text-[90px] leading-none transition-all duration-100 ${glitch ? "scale-110 -skew-x-2" : "scale-100"}`}
        style={{
          filter: glitch
            ? "drop-shadow(3px 0 #ff0000) drop-shadow(-3px 0 #00ffff)"
            : "drop-shadow(0 0 30px rgba(212,175,55,0.5))",
        }}
      >
        {SYMBOLS[symbolIdx]}
      </div>
    </div>
  );

  const Title = () => (
    <div className="text-center mb-8">
      <div className="text-[10px] tracking-[0.5em] text-yellow-600/40 uppercase font-mono mb-3">FUXEL presents</div>
      <h1 className="font-black uppercase leading-none mb-1"
        style={{ fontFamily: "Georgia, serif", fontSize: "clamp(48px, 12vw, 80px)", color: "#fff", textShadow: "0 0 40px rgba(212,175,55,0.2)" }}>
        FUXEL
      </h1>
      <h2 className="font-black uppercase leading-none"
        style={{ fontFamily: "Georgia, serif", fontSize: "clamp(28px, 7vw, 48px)", color: "#D4AF37", textShadow: "0 0 40px rgba(212,175,55,0.5)" }}>
        CLUB
      </h2>
      <div className="w-24 h-px mx-auto mt-4" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
    </div>
  );

  if (loading) return (
    <div className={containerClass} style={{ fontFamily: "Georgia, serif" }}>
      {feltBg}
      <div className="text-yellow-600 animate-pulse text-5xl relative z-10">♦</div>
    </div>
  );

  // ── STEP: CODE ──
  if (step === "code") return (
    <div className={containerClass} style={{ fontFamily: "Georgia, serif" }}>
      {feltBg}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <div className="text-xs tracking-[0.4em] text-yellow-600/30 uppercase font-mono">fuxel.club</div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-gray-600 font-mono">{playerCount} seated</span>
        </div>
      </nav>

      <div className="relative z-10 w-full max-w-sm text-center">
        <SymbolHeader />
        <Title />

        <p className="text-sm text-gray-500 font-mono mb-8 leading-relaxed">
          1,555 NFTs · Two paths to survive · Only the cards decide
        </p>

        <div className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setCodeError(""); }}
            onKeyDown={e => e.key === "Enter" && checkCode()}
            placeholder="ENTER ACCESS CODE"
            maxLength={20}
            className="w-full bg-black/60 border text-white text-center text-sm font-mono tracking-[0.3em] uppercase py-4 px-4 placeholder-gray-700 focus:outline-none transition-colors"
            style={{ borderColor: codeError ? "#ef4444" : "rgba(212,175,55,0.2)", letterSpacing: "0.3em" }}
          />
          {codeError && <p className="text-red-400 text-xs font-mono">{codeError}</p>}

          <button
            onClick={checkCode}
            disabled={checkingCode || !code.trim()}
            className="w-full py-4 font-black uppercase tracking-[0.3em] text-sm transition-all disabled:opacity-30"
            style={{ background: "linear-gradient(135deg, #8B0000, #5a0000)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37" }}
          >
            {checkingCode ? "Checking..." : "Enter"}
          </button>
        </div>

        <p className="text-[10px] text-gray-700 font-mono mt-6 uppercase tracking-wider">
          Need a code? Get one from someone already inside.
        </p>
      </div>
    </div>
  );

  // ── STEP: LOGIN ──
  if (step === "login") return (
    <div className={containerClass} style={{ fontFamily: "Georgia, serif" }}>
      {feltBg}
      <div className="relative z-10 w-full max-w-sm text-center">
        <SymbolHeader />
        <Title />

        <div className="border border-green-500/20 bg-green-500/5 py-2 px-4 mb-8">
          <span className="text-green-400 text-xs font-mono tracking-widest">✓ Code Accepted</span>
        </div>

        <p className="text-sm text-gray-500 font-mono mb-8">Sign in with X to claim your seat at the table.</p>

        <button
          onClick={signInWithX}
          className="w-full py-4 font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #1a1a1a, #000)", border: "1px solid rgba(212,175,55,0.4)", color: "#D4AF37" }}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Sign in with X
        </button>
      </div>
    </div>
  );

  // ── STEP: BIND WALLET ──
  if (step === "bind") return (
    <div className={containerClass} style={{ fontFamily: "Georgia, serif" }}>
      {feltBg}
      <div className="relative z-10 w-full max-w-sm text-center">
        <SymbolHeader />

        <div className="mb-8">
          <div className="text-[10px] tracking-[0.4em] text-yellow-600/40 uppercase font-mono mb-3">One Last Thing</div>
          <h2 className="text-3xl font-black uppercase" style={{ color: "#D4AF37" }}>Bind Your Wallet</h2>
          <div className="w-24 h-px mx-auto mt-4" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
        </div>

        <p className="text-sm text-gray-500 font-mono mb-2 leading-relaxed">
          Paste your wallet address. This is where your NFT goes if you win.
        </p>
        <p className="text-xs text-gray-700 font-mono mb-8">You won't be asked again.</p>

        <div className="space-y-3">
          <input
            type="text"
            value={wallet}
            onChange={e => { setWallet(e.target.value); setWalletError(""); }}
            placeholder="0x..."
            className="w-full bg-black/60 border text-white text-sm font-mono py-4 px-4 placeholder-gray-700 focus:outline-none transition-colors"
            style={{ borderColor: walletError ? "#ef4444" : "rgba(212,175,55,0.2)" }}
          />
          {walletError && <p className="text-red-400 text-xs font-mono">{walletError}</p>}

          <button
            onClick={handleBindWallet}
            disabled={bindingWallet || !wallet.trim()}
            className="w-full py-4 font-black uppercase tracking-[0.3em] text-sm transition-all disabled:opacity-30"
            style={{ background: "linear-gradient(135deg, #8B0000, #5a0000)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37" }}
          >
            {bindingWallet ? "Binding..." : "Bind Wallet"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── STEP: COUNTDOWN ──
return (
  <div className={containerClass} style={{ fontFamily: "Georgia, serif" }}>
    {feltBg}
    <div className="relative z-10 w-full max-w-sm text-center">
      <SymbolHeader />
      <Title />

      <p className="text-sm text-gray-500 font-mono mb-10 leading-relaxed">
        The table opens when the clock hits zero.
        <br />Stay sharp. The house is watching.
      </p>

      {/* Big countdown */}
      <div className="border border-yellow-600/20 bg-yellow-600/5 p-8 mb-8">
        <div className="text-[10px] text-yellow-600/40 uppercase tracking-widest font-mono mb-4">
          Table Opens In
        </div>
        <div className="flex items-center justify-center gap-4">
          {[
            { val: time.d, label: "days" },
            { val: time.h, label: "hrs" },
            { val: time.m, label: "min" },
            { val: time.s, label: "sec" },
          ].map((t, i) => (
            <div key={t.label} className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-black tabular-nums"
                  style={{ color: "#D4AF37", fontFamily: "Georgia", textShadow: "0 0 20px rgba(212,175,55,0.5)" }}>
                  {pad(t.val)}
                </div>
                <div className="text-[9px] text-gray-600 uppercase tracking-widest font-mono mt-1">
                  {t.label}
                </div>
              </div>
              {i < 3 && <div className="text-yellow-600/40 text-2xl font-black mb-4">:</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="text-[10px] text-gray-700 font-mono uppercase tracking-wider">
        Seat secured · @{clubUser?.x_username}
      </div>
    </div>
  </div>
);
