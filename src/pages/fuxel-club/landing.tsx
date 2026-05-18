import { useState, useEffect } from "react";

const SYMBOLS = ["♠", "♥", "♦", "♣", "★", "🃏", "👑"];

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

export default function ClubLanding() {
  const [symbolIdx, setSymbolIdx] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [countdownEnd, setCountdownEnd] = useState(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
  const [playerCount, setPlayerCount] = useState(0);

  const time = useCountdown(countdownEnd);

  useEffect(() => {
    fetch("https://keihfhxdgfoladjhuvlk.supabase.co/rest/v1/game_stats?select=countdown_ends_at,total_players&limit=1", {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ""}`,
      },
    })
      .then(r => r.json())
      .then(data => {
        if (data?.[0]?.countdown_ends_at) setCountdownEnd(new Date(data[0].countdown_ends_at));
        if (data?.[0]?.total_players) setPlayerCount(data[0].total_players);
      })
      .catch(() => {});

    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
      setSymbolIdx(i => (i + 1) % SYMBOLS.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className="min-h-screen text-white overflow-hidden relative flex flex-col items-center justify-center"
      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
    >
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
          background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.8) 100%)",
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

      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5">
        <div className="text-xs tracking-[0.5em] text-yellow-500/40 uppercase font-mono">fuxel.club</div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          <span className="text-[10px] text-yellow-500/50 tracking-widest uppercase font-mono">
            {playerCount} / 500 seated
          </span>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg mx-auto w-full">
        
        {/* Animated symbol */}
        <div className="relative mb-4 select-none">
          <div
            className={`text-[120px] leading-none transition-all duration-150 ${glitch ? "scale-110 -skew-x-3" : "scale-100"}`}
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

        {/* Title */}
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

        {/* Gold divider */}
        <div
          className="w-32 h-px my-6"
          style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }}
        />

        {/* Tagline */}
        <p className="text-sm text-yellow-100/40 font-mono tracking-widest uppercase mb-10">
          1,555 NFTs · Top 500 Survive · The Cards Decide
        </p>

        {/* Countdown */}
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
                  <div className="text-yellow-500/30 font-black text-3xl mb-6">:</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-yellow-500/30">
          <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/50 animate-pulse" />
          <span>Game launches when timer hits zero</span>
        </div>
      </div>

      {/* Bottom border */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" }}
      />
    </div>
  );
}
ppercase" style={{ color: "#D4AF37" }}>Bind Your Wallet</h2>
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
