import { useState, useEffect } from "react";

const SYMBOLS = ["♠", "♥", "♦", "♣", "★", "🃏", "👑"];

// ── Types ──────────────────────────────────────────────────────────────────
interface ClubUser {
  x_username: string;
}

// ── Hooks ──────────────────────────────────────────────────────────────────
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

// ── Shared helpers ─────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");

const containerClass =
  "min-h-screen bg-black text-white overflow-hidden relative flex flex-col items-center justify-center px-6";

// ── Shared sub-components ──────────────────────────────────────────────────
function FeltBackground() {
  return (
    <>
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://keihfhxdgfoladjhuvlk.supabase.co/storage/v1/object/public/Images/Background.PNG')`,
        }}
      />
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/40" />
      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.8) 100%)",
        }}
      />
      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 3px)",
        }}
      />
      {/* Bottom border */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
        }}
      />
    </>
  );
}

function AnimatedSymbol() {
  const [symbolIdx, setSymbolIdx] = useState(0);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
      setSymbolIdx((i) => (i + 1) % SYMBOLS.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative mb-4 select-none">
      <div
        className={`text-[80px] leading-none transition-all duration-150 ${
          glitch ? "scale-110 -skew-x-3" : "scale-100"
        }`}
        style={{
          filter: glitch
            ? "drop-shadow(4px 0 #ff0000) drop-shadow(-4px 0 #00ffff)"
            : "drop-shadow(0 0 40px rgba(212,175,55,0.6))",
          transition: "filter 0.15s",
          color: "#D4AF37",
        }}
      >
        {SYMBOLS[symbolIdx]}
      </div>
    </div>
  );
}

function Title() {
  return (
    <div className="mb-2">
      <h1
        className="font-black uppercase leading-none tracking-tight"
        style={{
          fontFamily: "Georgia, serif",
          fontSize: "clamp(56px, 14vw, 96px)",
          color: "#fff",
          textShadow: "0 0 60px rgba(212,175,55,0.3), 0 4px 20px rgba(0,0,0,0.8)",
        }}
      >
        FUXEL
      </h1>
      <h2
        className="font-black uppercase leading-none"
        style={{
          fontFamily: "Georgia, serif",
          fontSize: "clamp(28px, 7vw, 52px)",
          color: "#D4AF37",
          textShadow: "0 0 40px rgba(212,175,55,0.6), 0 2px 10px rgba(0,0,0,0.8)",
        }}
      >
        CLUB
      </h2>
    </div>
  );
}

function GoldDivider() {
  return (
    <div
      className="w-32 h-px my-6"
      style={{
        background: "linear-gradient(90deg, transparent, #D4AF37, transparent)",
      }}
    />
  );
}

// ── STEP: LANDING (public) ─────────────────────────────────────────────────
function LandingStep({ playerCount }: { playerCount: number }) {
  const [countdownEnd] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  );
  const time = useCountdown(countdownEnd);

  return (
    <div
      className={containerClass}
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
    >
      <FeltBackground />

      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5">
        <div className="text-xs tracking-[0.5em] text-yellow-500/40 uppercase font-mono">
          fuxel.club
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          <span className="text-[10px] text-yellow-500/50 tracking-widest uppercase font-mono">
            {playerCount} / 500 seated
          </span>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto w-full">
        <AnimatedSymbol />
        <Title />
        <GoldDivider />

        <p className="text-sm text-yellow-100/40 font-mono tracking-widest uppercase mb-10">
          1,555 NFTs · Top 500 Survive · The Cards Decide
        </p>

        {/* Countdown */}
        <div
          className="border border-yellow-500/20 bg-black/50 backdrop-blur-sm p-8 w-full mb-8"
          style={{
            boxShadow:
              "0 0 60px rgba(212,175,55,0.1), inset 0 0 40px rgba(212,175,55,0.02)",
          }}
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
                    className="text-5xl md:text-6xl font-black tabular-nums"
                    style={{
                      color: "#D4AF37",
                      fontFamily: "Georgia, serif",
                      textShadow: "0 0 30px rgba(212,175,55,0.5)",
                    }}
                  >
                    {pad(t.val)}
                  </div>
                  <div className="text-[9px] text-yellow-500/30 uppercase tracking-widest font-mono mt-2">
                    {t.label}
                  </div>
                </div>
                {i < 3 && (
                  <div className="text-yellow-500/30 font-black text-3xl mb-6">
                    :
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-yellow-500/30">
          <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/50 animate-pulse" />
          <span>Game launches when timer hits zero</span>
        </div>
      </div>
    </div>
  );
}

// ── STEP: BIND WALLET ──────────────────────────────────────────────────────
function BindWalletStep({ onBound }: { onBound: (wallet: string) => void }) {
  const [wallet, setWallet] = useState("");
  const [walletError, setWalletError] = useState("");
  const [bindingWallet, setBindingWallet] = useState(false);

  const handleBindWallet = async () => {
    if (!wallet.trim()) {
      setWalletError("Wallet address is required.");
      return;
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(wallet.trim())) {
      setWalletError("Enter a valid Ethereum address (0x…).");
      return;
    }
    setBindingWallet(true);
    try {
      // TODO: persist wallet to your backend / Supabase here
      await new Promise((r) => setTimeout(r, 800)); // simulated delay
      onBound(wallet.trim());
    } catch {
      setWalletError("Something went wrong. Try again.");
    } finally {
      setBindingWallet(false);
    }
  };

  return (
    <div
      className={containerClass}
      style={{ fontFamily: "Georgia, serif" }}
    >
      <FeltBackground />

      <div className="relative z-10 w-full max-w-sm text-center">
        <AnimatedSymbol />
        <Title />
        <GoldDivider />

        <div className="mb-8">
          <h2
            className="text-lg font-black uppercase tracking-[0.3em]"
            style={{ color: "#D4AF37" }}
          >
            Bind Your Wallet
          </h2>
          <div
            className="w-24 h-px mx-auto mt-4"
            style={{
              background:
                "linear-gradient(90deg, transparent, #D4AF37, transparent)",
            }}
          />
        </div>

        <p className="text-sm text-gray-500 font-mono mb-2 leading-relaxed">
          Paste your wallet address. This is where your NFT goes if you win.
        </p>
        <p className="text-xs text-gray-700 font-mono mb-8">
          You won't be asked again.
        </p>

        <div className="space-y-3">
          <input
            type="text"
            value={wallet}
            onChange={(e) => {
              setWallet(e.target.value);
              setWalletError("");
            }}
            placeholder="0x..."
            className="w-full bg-black/60 border text-white text-sm font-mono py-4 px-4 placeholder-gray-700 focus:outline-none transition-colors"
            style={{
              borderColor: walletError ? "#ef4444" : "rgba(212,175,55,0.2)",
            }}
          />
          {walletError && (
            <p className="text-red-400 text-xs font-mono">{walletError}</p>
          )}

          <button
            onClick={handleBindWallet}
            disabled={bindingWallet || !wallet.trim()}
            className="w-full py-4 font-black uppercase tracking-[0.3em] text-sm transition-all disabled:opacity-30"
            style={{
              background: "linear-gradient(135deg, #8B0000, #5a0000)",
              border: "1px solid rgba(212,175,55,0.3)",
              color: "#D4AF37",
            }}
          >
            {bindingWallet ? "Binding..." : "Bind Wallet"}
          </button>
        </div>
      </div>
    </div>
  );
}
