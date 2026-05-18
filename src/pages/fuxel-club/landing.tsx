import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useClubAuth } from "@/hooks/use-club-auth";

const SYMBOLS = ["♠", "♥", "♦", "♣", "★", "🃏", "👑"];
const MASK_LABELS = ["KING", "JESTER", "QUEEN", "ACE", "JOKER"];

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

type Step = "login" | "code" | "bind" | "countdown";

export default function ClubLanding() {
  const [, navigate] = useLocation();
  const { authUser, clubUser, loading, signInWithX, refreshUser } = useClubAuth();

  const [step, setStep] = useState<Step>("login");
  const [symbolIdx, setSymbolIdx] = useState(0);
  const [maskIdx, setMaskIdx] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [countdownEnd, setCountdownEnd] = useState(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
  const [playerCount, setPlayerCount] = useState(0);

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  const [wallet, setWallet] = useState("");
  const [walletError, setWalletError] = useState("");
  const [bindingWallet, setBindingWallet] = useState(false);

  const time = useCountdown(countdownEnd);
  const pad = (n: number) => String(n).padStart(2, "0");
  const bgImage = "url('https://keihfhxdgfoladjhuvlk.supabase.co/storage/v1/object/public/Images/Background.PNG')";

  // Fetch game stats + start glitch interval
  useEffect(() => {
    supabase
      .from("game_stats")
      .select("countdown_ends_at, total_players")
      .single()
      .then(({ data }) => {
        if (data?.countdown_ends_at) setCountdownEnd(new Date(data.countdown_ends_at));
        if (data?.total_players) setPlayerCount(data.total_players);
      });

    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
      setSymbolIdx((i) => (i + 1) % SYMBOLS.length);
      setMaskIdx((i) => (i + 1) % MASK_LABELS.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  // Flow: login → code → bind → countdown
  useEffect(() => {
    if (loading) return;

    // Not signed in → login
    if (!authUser) {
      setStep("login");
      return;
    }

    // Signed in + wallet bound → countdown
    if (clubUser?.wallet_address) {
      setStep("countdown");
      return;
    }

    // Signed in + registered but no wallet → bind
    if (clubUser && !clubUser.wallet_address) {
      setStep("bind");
      return;
    }

    // Signed in + not registered → check if code already done
    const savedCode = sessionStorage.getItem("fuxel_code_verified");
    if (savedCode) {
      setStep("bind");
    } else {
      setStep("code");
    }
  }, [loading, authUser, clubUser]);

  // Auto-navigate when countdown ends
  useEffect(() => {
    if (step === "countdown" && time.done) {
      navigate("/club/home");
    }
  }, [time.done, step, navigate]);

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
      if (data.uses_remaining <= 0) { setCodeError("This code has been fully claimed."); return; }

      sessionStorage.setItem("fuxel_code_verified", data.code);
      setStep("bind");
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
      const meta = authUser.user_metadata || {};
      const xUsername = meta.user_name || meta.preferred_username || meta.name || "unknown";
      const xAvatar = meta.avatar_url || "";
      const referralCode = `FUXEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const accessCode = sessionStorage.getItem("fuxel_code_verified") || "";

      const { data: existing } = await supabase
        .from("users").select("id, wallet_address").eq("x_id", xId).single();

      if (existing) {
        await supabase.from("users").update({ wallet_address: wallet.trim() }).eq("x_id", xId);
      } else {
        if (accessCode) await supabase.rpc("use_access_code", { code_text: accessCode });
        await supabase.from("users").insert({
          x_id: xId,
          x_username: xUsername,
          x_avatar: xAvatar,
          chips: 100,
          referral_code: referralCode,
          wallet_address: wallet.trim(),
        });
        await supabase.rpc("increment_players");
      }

      await refreshUser();
      setStep("countdown");
    } catch {
      setWalletError("Failed to bind wallet. Try again.");
    } finally {
      setBindingWallet(false);
    }
  };

  // ── Shared layers ──────────────────────────────────────────────────────
  const Bg = () => (
    <>
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: bgImage }} />
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.85) 100%)" }} />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 3px)" }} />
      <div className="fixed bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" }} />
    </>
  );

  const Nav = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5">
      <div className="text-xs tracking-[0.5em] text-yellow-500/30 uppercase font-mono">fuxel.club</div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        <span className="text-[10px] text-yellow-500/40 tracking-widest uppercase font-mono">{playerCount} / 500 seated</span>
      </div>
    </nav>
  );

  const Symbol = () => (
    <div className="relative mb-6 select-none">
      <div
        className={`text-[100px] leading-none transition-all duration-150 ${glitch ? "scale-110 -skew-x-3" : "scale-100"}`}
        style={{
          filter: glitch ? "drop-shadow(4px 0 #ff0000) drop-shadow(-4px 0 #00ffff)" : "drop-shadow(0 0 40px rgba(212,175,55,0.6))",
          transition: "filter 0.15s",
          color: "#D4AF37",
        }}
      >
        {SYMBOLS[symbolIdx]}
      </div>
      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.5em] uppercase font-mono transition-all duration-200 ${glitch ? "text-red-400" : "text-yellow-600/50"}`}>
        {MASK_LABELS[maskIdx]}
      </div>
    </div>
  );

  const TitleBlock = () => (
    <div className="text-center mb-8">
      <div className="text-[10px] tracking-[0.5em] text-yellow-500/30 uppercase font-mono mb-3">FUXEL presents</div>
      <h1 className="font-black uppercase leading-none" style={{ fontFamily: "Georgia, serif", fontSize: "clamp(52px, 13vw, 90px)", color: "#fff", textShadow: "0 0 60px rgba(212,175,55,0.3), 0 4px 20px rgba(0,0,0,0.8)" }}>FUXEL</h1>
      <h2 className="font-black uppercase leading-none" style={{ fontFamily: "Georgia, serif", fontSize: "clamp(26px, 6.5vw, 48px)", color: "#D4AF37", textShadow: "0 0 40px rgba(212,175,55,0.6), 0 2px 10px rgba(0,0,0,0.8)" }}>CLUB</h2>
      <div className="w-28 h-px mx-auto mt-4" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
    </div>
  );

  const pageClass = "min-h-screen text-white overflow-hidden relative flex flex-col items-center justify-center px-6";
  const pageStyle = { fontFamily: "'Playfair Display', Georgia, serif" };

  // ── LOADING ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: bgImage }} />
        <div className="fixed inset-0 bg-black/50" />
        <div className="text-yellow-600 animate-pulse text-5xl relative z-10">♦</div>
      </div>
    );
  }

  // ── STEP 1: LOGIN WITH X ───────────────────────────────────────────────
  if (step === "login") {
    return (
      <div className={pageClass} style={pageStyle}>
        <Bg /><Nav />
        <div className="relative z-10 w-full max-w-sm text-center">
          <Symbol />
          <TitleBlock />
          <p className="text-sm text-gray-400 font-mono mb-8 leading-relaxed">
            1,555 NFTs · Two paths to survive · Only the cards decide
          </p>
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
          <p className="text-[10px] text-gray-600 font-mono mt-6 uppercase tracking-wider">
            You'll need an access code after signing in.
          </p>
        </div>
      </div>
    );
  }

  // ── STEP 2: ACCESS CODE ────────────────────────────────────────────────
  if (step === "code") {
    return (
      <div className={pageClass} style={pageStyle}>
        <Bg /><Nav />
        <div className="relative z-10 w-full max-w-sm text-center">
          <Symbol />
          <TitleBlock />
          <div className="border border-green-500/20 bg-green-500/5 py-2 px-4 mb-8">
            <span className="text-green-400 text-xs font-mono tracking-widest">✓ Signed in with X</span>
          </div>
          <p className="text-sm text-gray-400 font-mono mb-8 leading-relaxed">
            Enter your access code to claim a seat.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(""); }}
              onKeyDown={(e) => e.key === "Enter" && checkCode()}
              placeholder="ENTER ACCESS CODE"
              maxLength={20}
              className={`w-full bg-black/60 border text-white text-center text-sm font-mono tracking-[0.3em] uppercase py-4 px-4 placeholder-gray-600 focus:outline-none transition-colors ${codeError ? "border-red-500/50" : "border-yellow-600/20 focus:border-yellow-600/50"}`}
            />
            {codeError && <p className="text-red-400 text-xs font-mono">{codeError}</p>}
            <button
              onClick={checkCode}
              disabled={checkingCode || !code.trim()}
              className={`w-full py-4 font-black uppercase tracking-[0.3em] text-sm transition-all ${checkingCode || !code.trim() ? "opacity-30 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"}`}
              style={{ background: "linear-gradient(135deg, #8B0000, #5a0000)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37" }}
            >
              {checkingCode ? "Checking..." : "Enter"}
            </button>
          </div>
          <p className="text-[10px] text-gray-600 font-mono mt-6 uppercase tracking-wider">
            Need a code? Get one from someone already inside.
          </p>
        </div>
      </div>
    );
  }

  // ── STEP 3: BIND WALLET ────────────────────────────────────────────────
  if (step === "bind") {
    return (
      <div className={pageClass} style={pageStyle}>
        <Bg /><Nav />
        <div className="relative z-10 w-full max-w-sm text-center">
          <Symbol />
          <div className="mb-8">
            <div className="text-[10px] tracking-[0.4em] text-yellow-500/30 uppercase font-mono mb-3">One Last Thing</div>
            <h2 className="text-3xl font-black uppercase" style={{ color: "#D4AF37", textShadow: "0 0 30px rgba(212,175,55,0.3)" }}>
              Bind Your Wallet
            </h2>
            <div className="w-24 h-px mx-auto mt-4" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
          </div>
          <p className="text-sm text-gray-400 font-mono mb-2 leading-relaxed">
            Paste your wallet address. This is where your NFT goes if you win.
          </p>
          <p className="text-xs text-gray-600 font-mono mb-8">You won't be asked again.</p>
          <div className="space-y-3">
            <input
              type="text"
              value={wallet}
              onChange={(e) => { setWallet(e.target.value); setWalletError(""); }}
              placeholder="0x..."
              className={`w-full bg-black/60 border text-white text-sm font-mono py-4 px-4 placeholder-gray-600 focus:outline-none transition-colors ${walletError ? "border-red-500/50" : "border-yellow-600/20 focus:border-yellow-600/50"}`}
            />
            {walletError && <p className="text-red-400 text-xs font-mono">{walletError}</p>}
            <button
              onClick={handleBindWallet}
              disabled={bindingWallet || !wallet.trim()}
              className={`w-full py-4 font-black uppercase tracking-[0.3em] text-sm transition-all ${bindingWallet || !wallet.trim() ? "opacity-30 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"}`}
              style={{ background: "linear-gradient(135deg, #8B0000, #5a0000)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37" }}
            >
              {bindingWallet ? "Binding..." : "Bind Wallet"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 4: COUNTDOWN ─────────────────────────────────────────────────
  return (
    <div className={pageClass} style={pageStyle}>
      <Bg /><Nav />
      <div className="relative z-10 w-full max-w-sm text-center">
        <Symbol />
        <TitleBlock />
        <p className="text-sm text-gray-400 font-mono mb-10 leading-relaxed">
          The table opens when the clock hits zero.
          <br />Stay sharp. The house is watching.
        </p>
        <div
          className="border border-yellow-500/20 bg-black/50 backdrop-blur-sm p-8 w-full mb-8"
          style={{ boxShadow: "0 0 60px rgba(212,175,55,0.1), inset 0 0 40px rgba(212,175,55,0.02)" }}
        >
          <div className="text-[10px] text-yellow-500/40 uppercase tracking-[0.4em] font-mono mb-5">
            Table Opens In
          </div>
          <div className="flex items-center justify-center gap-2">
            {[
              { val: time.d, label: "days" },
              { val: time.h, label: "hrs" },
              { val: time.m, label: "min" },
              { val: time.s, label: "sec" },
            ].map((t, i) => (
              <div key={t.label} className="flex items-center gap-2">
                <div className="text-center">
                  <div
                    className="text-5xl font-black tabular-nums"
                    style={{ color: "#D4AF37", fontFamily: "Georgia, serif", textShadow: "0 0 30px rgba(212,175,55,0.5)" }}
                  >
                    {pad(t.val)}
                  </div>
                  <div className="text-[9px] text-yellow-500/30 uppercase tracking-widest font-mono mt-2">
                    {t.label}
                  </div>
                </div>
                {i < 3 && <div className="text-yellow-500/30 font-black text-3xl mb-6">:</div>}
              </div>
            ))}
          </div>
        </div>
        {clubUser && (
          <div className="text-[10px] text-gray-700 font-mono uppercase tracking-wider">
            Seat secured · @{clubUser.x_username}
          </div>
        )}
      </div>
    </div>
  );
}
