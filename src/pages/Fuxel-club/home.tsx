import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useClubAuth } from "@/hooks/use-club-auth";
import { Menu, X, Copy, Check, Zap, Clock, Star } from "lucide-react";

const SUITS = ["♠", "♥", "♦", "♣"] as const;
const RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
type Suit = typeof SUITS[number];
type Rank = typeof RANKS[number];

interface Card { rank: Rank; suit: Suit; chips?: number; }
interface PlayerCard { id: string; card_rank: string; card_suit: string; }

const SUIT_COLOR: Record<Suit, string> = {
  "♠": "#e2e8f0", "♣": "#e2e8f0",
  "♥": "#ef4444", "♦": "#ef4444",
};

const DAILY_REWARDS = [
  { day: 1, chips: 100, mystery: false, poker_face: false },
  { day: 2, chips: 200, mystery: false, poker_face: false },
  { day: 3, chips: 0, mystery: true, poker_face: false },
  { day: 4, chips: 300, mystery: false, poker_face: false },
  { day: 5, chips: 100, mystery: true, poker_face: false },
  { day: 6, chips: 500, mystery: false, poker_face: false },
  { day: 7, chips: 100, mystery: false, poker_face: true },
];

function generateRandomCard(): Card {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const chipsChance = Math.random();
  const chips = chipsChance < 0.3 ? [100, 200, 300, 500, 1000][Math.floor(Math.random() * 5)] : undefined;
  return { rank, suit, chips };
}

function generateShuffleDeck(): Card[] {
  return Array.from({ length: 6 }, generateRandomCard);
}

function generateInitialDeck(): Card[] {
  return Array.from({ length: 9 }, generateRandomCard);
}

// Card back component
function CardBack({ onClick, disabled, size = "normal" }: { onClick?: () => void; disabled?: boolean; size?: "normal" | "small" }) {
  const dim = size === "small" ? "w-16 h-24" : "w-20 h-28 md:w-24 md:h-32";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${dim} relative rounded-sm border transition-all duration-300 group
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-105 hover:-translate-y-1 cursor-pointer hover:shadow-2xl"}
      `}
      style={{
        background: "linear-gradient(135deg, #0a1a0a, #0d1f0d)",
        border: "1px solid rgba(212,175,55,0.3)",
        boxShadow: disabled ? "none" : "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Fox logo placeholder — replace with actual fox SVG */}
      <div className="absolute inset-0 flex items-center justify-center flex-col gap-1">
        <div className="text-2xl opacity-60">🦊</div>
        <div className="text-[8px] tracking-widest text-yellow-600/40 uppercase font-mono">FUXEL</div>
      </div>
      {/* Corner suits */}
      <div className="absolute top-1 left-1 text-[10px] text-yellow-600/20">♠</div>
      <div className="absolute bottom-1 right-1 text-[10px] text-yellow-600/20 rotate-180">♠</div>
      {/* Hover glow */}
      {!disabled && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm"
          style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.1), transparent)" }} />
      )}
    </button>
  );
}

// Card front component
function CardFront({ card, size = "normal" }: { card: Card; size?: "normal" | "small" }) {
  const dim = size === "small" ? "w-16 h-24" : "w-20 h-28 md:w-24 md:h-32";
  const color = SUIT_COLOR[card.suit];
  return (
    <div className={`${dim} relative rounded-sm bg-white flex flex-col p-1.5`}
      style={{ border: "1px solid rgba(212,175,55,0.3)", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
      <div className="flex flex-col items-start leading-none">
        <span className="font-black text-sm" style={{ color }}>{card.rank}</span>
        <span className="text-sm" style={{ color }}>{card.suit}</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {card.chips ? (
          <div className="text-center">
            <div className="text-yellow-500 font-black text-xs">+{card.chips}</div>
            <div className="text-gray-400 text-[9px] font-mono">chips</div>
          </div>
        ) : (
          <span className="text-3xl font-black" style={{ color }}>{card.suit}</span>
        )}
      </div>
      <div className="flex flex-col items-end leading-none rotate-180">
        <span className="font-black text-sm" style={{ color }}>{card.rank}</span>
        <span className="text-sm" style={{ color }}>{card.suit}</span>
      </div>
    </div>
  );
}

// Flipping card
function FlippingCard({ card, onFlip, flipped, disabled, size = "normal" }: {
  card: Card; onFlip: () => void; flipped: boolean; disabled: boolean; size?: "normal" | "small";
}) {
  return (
    <div className="relative" style={{ perspective: "600px" }}>
      <div
        className="relative transition-all duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div style={{ backfaceVisibility: "hidden" }}>
          <CardBack onClick={onFlip} disabled={disabled} size={size} />
        </div>
        <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", top: 0, left: 0 }}>
          <CardFront card={card} size={size} />
        </div>
      </div>
    </div>
  );
}

// Diamond layout positions for 9 cards
const DIAMOND_9 = [
  { row: 0, col: 2 }, // top center (9)
  { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, // row 2
  { row: 2, col: 0 }, { row: 2, col: 2 }, { row: 2, col: 4 }, // row 3 (center)
  { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }, // row 4
];

// Diamond layout for 6 cards
const DIAMOND_6 = [
  { row: 0, col: 1 }, { row: 0, col: 2 }, // top
  { row: 1, col: 0 }, { row: 1, col: 2 }, // middle sides (center gap)
  { row: 2, col: 1 }, { row: 2, col: 2 }, // bottom
];

export default function ClubHome() {
  const [, navigate] = useLocation();
  const { clubUser, authUser, isAuthenticated, loading, signOut, refreshUser } = useClubAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initial pick state
  const [showInitialPick, setShowInitialPick] = useState(false);
  const [initialDeck, setInitialDeck] = useState<Card[]>([]);
  const [initialFlipped, setInitialFlipped] = useState<boolean[]>(Array(9).fill(false));
  const [initialPickCount, setInitialPickCount] = useState(0);
  const [showProceed, setShowProceed] = useState(false);
  const [proceedGlitch, setProceedGlitch] = useState(false);

  // Shuffle state
  const [shuffleDeck, setShuffleDeck] = useState<Card[]>([]);
  const [shuffleFlipped, setShuffleFlipped] = useState<boolean[]>(Array(6).fill(false));
  const [shuffleTimeLeft, setShuffleTimeLeft] = useState(0);
  const [canPick, setCanPick] = useState(false);
  const [shufflePicked, setShufflePicked] = useState(false);

  // Player hand
  const [playerHand, setPlayerHand] = useState<PlayerCard[]>([]);

  // Daily claim
  const [canClaim, setCanClaim] = useState(false);
  const [claimDay, setClaimDay] = useState(1);

  // Poker face mode
  const [pokerFaceActive, setPokerFaceActive] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/club");
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (!clubUser) return;
    checkInitialPick();
    loadPlayerHand();
    checkDailyClaim();
    startShuffleTimer();
    setShuffleDeck(generateShuffleDeck());
  }, [clubUser]);

  const checkInitialPick = async () => {
    if (!clubUser) return;
    const { count } = await supabase
      .from("player_cards")
      .select("id", { count: "exact" })
      .eq("user_id", clubUser.id)
      .eq("source", "free_pick");
    if ((count ?? 0) === 0) {
      setInitialDeck(generateInitialDeck());
      setShowInitialPick(true);
    }
  };

  const loadPlayerHand = async () => {
    if (!clubUser) return;
    const { data } = await supabase
      .from("player_cards")
      .select("id, card_rank, card_suit")
      .eq("user_id", clubUser.id)
      .eq("listed_on_deck", false);
    if (data) setPlayerHand(data);
  };

  const checkDailyClaim = () => {
    if (!clubUser?.last_claim) { setCanClaim(true); setClaimDay(1); return; }
    const last = new Date(clubUser.last_claim);
    const now = new Date();
    const diff = now.getTime() - last.getTime();
    const daysPassed = Math.floor(diff / 86400000);
    if (daysPassed >= 1) {
      setCanClaim(true);
      setClaimDay(Math.min((clubUser.daily_streak || 0) + 1, 7));
    }
  };

  const startShuffleTimer = () => {
    const tick = () => {
      const now = Date.now();
      const cycleMs = 2 * 60 * 60 * 1000;
      const remaining = cycleMs - (now % cycleMs);
      setShuffleTimeLeft(remaining);
      setCanPick(remaining > cycleMs - 60000); // pick window: first minute of cycle
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  };

  const handleInitialFlip = (idx: number) => {
    if (initialPickCount >= 3) return;
    if (initialFlipped[idx]) return;

    const newFlipped = [...initialFlipped];
    newFlipped[idx] = true;
    setInitialFlipped(newFlipped);
    const newCount = initialPickCount + 1;
    setInitialPickCount(newCount);

    // Save card + deduct 10 chips
    const card = initialDeck[idx];
    saveCard(card, "free_pick");

    if (newCount === 3) {
      setTimeout(() => {
        setShowProceed(true);
        setProceedGlitch(true);
      }, 800);
    }
  };

  const saveCard = async (card: Card, source: string) => {
    if (!clubUser) return;
    if (card.chips) {
      await supabase.from("users").update({ chips: clubUser.chips + card.chips - 10 }).eq("id", clubUser.id);
    } else {
      await supabase.from("player_cards").insert({
        user_id: clubUser.id,
        card_rank: card.rank,
        card_suit: card.suit,
        source,
      });
      await supabase.from("users").update({ chips: clubUser.chips - 10 }).eq("id", clubUser.id);
    }
    refreshUser();
  };

  const handleShuffleFlip = (idx: number) => {
    if (shufflePicked || shuffleFlipped[idx] || !canPick) return;
    if ((clubUser?.chips ?? 0) < 10) return;

    const newFlipped = [...shuffleFlipped];
    newFlipped[idx] = true;
    setShuffleFlipped(newFlipped);
    setShufflePicked(true);
    saveCard(shuffleDeck[idx], "shuffle");
    loadPlayerHand();
  };

  const handleDailyClaim = async () => {
    if (!clubUser || !canClaim) return;
    const reward = DAILY_REWARDS[(claimDay - 1) % 7];
    let chipsToAdd = reward.chips;
    let pokerFace = reward.poker_face;
    let mysteryCard = null;

    if (reward.mystery) {
      mysteryCard = generateRandomCard();
      if (mysteryCard.chips) chipsToAdd += mysteryCard.chips;
      else {
        await supabase.from("player_cards").insert({
          user_id: clubUser.id,
          card_rank: mysteryCard.rank,
          card_suit: mysteryCard.suit,
          source: "daily",
        });
      }
    }

    await supabase.from("users").update({
      chips: clubUser.chips + chipsToAdd,
      daily_streak: claimDay,
      last_claim: new Date().toISOString(),
      poker_face_available: pokerFace || clubUser.poker_face_available,
    }).eq("id", clubUser.id);

    setCanClaim(false);
    refreshUser();
    loadPlayerHand();
  };

  const copyReferral = () => {
    if (!clubUser?.referral_code) return;
    navigator.clipboard.writeText(clubUser.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-yellow-600 animate-pulse text-4xl">♦</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>

      {/* Felt bg */}
      <div className="fixed inset-0 opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 30%, #0d3b1e 0%, #000 70%)" }} />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 border-b border-yellow-600/10 bg-black/80 backdrop-blur-md">
        <Link href="/club/home">
          <span className="text-sm font-black tracking-widest" style={{ color: "#D4AF37" }}>FUXEL</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Chips */}
          <div className="flex items-center gap-1.5 border border-yellow-600/20 px-3 py-1.5 bg-yellow-600/5">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <span className="font-black text-sm tabular-nums" style={{ color: "#D4AF37", fontFamily: "Georgia" }}>
              {clubUser?.chips ?? 0}
            </span>
            <span className="text-[10px] text-gray-600 uppercase font-mono">chips</span>
          </div>

          {/* Menu */}
          <button onClick={() => setMenuOpen(true)} className="text-gray-400 hover:text-yellow-500 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#080808] border-l border-yellow-600/10 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-yellow-600/10">
              <span className="font-black tracking-widest text-sm" style={{ color: "#D4AF37" }}>FUXEL.CLUB</span>
              <button onClick={() => setMenuOpen(false)} className="text-gray-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile */}
            <div className="px-6 py-4 border-b border-yellow-600/5">
              <div className="flex items-center gap-3 mb-3">
                {clubUser?.x_avatar && (
                  <img src={clubUser.x_avatar} alt="" className="h-8 w-8 rounded-full border border-yellow-600/20" />
                )}
                <div>
                  <div className="text-sm font-bold text-white">@{clubUser?.x_username}</div>
                  <div className="text-xs text-gray-600 font-mono">{clubUser?.chips} chips</div>
                </div>
              </div>

              {/* Referral code */}
              <div className="bg-yellow-600/5 border border-yellow-600/10 px-3 py-2">
                <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Your Referral Code</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-yellow-500 tracking-wider">{clubUser?.referral_code}</span>
                  <button onClick={copyReferral} className="text-gray-500 hover:text-yellow-500 transition-colors">
                    {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="text-[9px] text-gray-700 mt-1 font-mono">+50 chips per referral • max 5 uses</div>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex-1 py-4 px-4 space-y-1">
              {[
                { href: "/club/home", label: "Home" },
                { href: "/club/board", label: "Leaderboard" },
                { href: "/club/hands", label: "Show Hands" },
                { href: "/club/deck", label: "The Deck" },
                { href: "/club/how", label: "How To Play" },
              ].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                  <div className="px-3 py-3 text-sm text-gray-400 hover:text-yellow-500 hover:bg-yellow-600/5 transition-colors cursor-pointer tracking-wider uppercase font-mono">
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-yellow-600/10">
              <button onClick={signOut} className="text-xs text-gray-600 hover:text-red-400 transition-colors uppercase tracking-widest font-mono">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INITIAL PICK MODAL */}
      {showInitialPick && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.95)" }}>
          <div className="max-w-lg w-full text-center">
            <div className="text-4xl mb-3">🦊</div>
            <h2 className="text-2xl font-black mb-2" style={{ color: "#D4AF37" }}>Welcome to the Table</h2>
            <p className="text-sm text-gray-500 mb-2 font-mono">
              You have 100 chips. Pick 3 cards. Each costs 10 chips.
            </p>
            <p className="text-xs text-gray-700 mb-8 font-mono tracking-wider">
              Cards may contain chips or playing cards for your hand.
            </p>

            {/* 9 card diamond grid */}
            <div className="grid grid-cols-5 gap-2 mb-6 place-items-center">
              {DIAMOND_9.map((pos, idx) => (
                <div key={idx} style={{ gridColumn: pos.col + 1, gridRow: pos.row + 1 }}>
                  <FlippingCard
                    card={initialDeck[idx] || { rank: "A", suit: "♠" }}
                    onFlip={() => handleInitialFlip(idx)}
                    flipped={initialFlipped[idx]}
                    disabled={initialPickCount >= 3 && !initialFlipped[idx]}
                    size="small"
                  />
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-600 font-mono mb-6">
              {3 - initialPickCount} picks remaining
            </div>

            {showProceed && (
              <button
                onClick={() => setShowInitialPick(false)}
                className={`w-full py-4 font-black uppercase tracking-[0.3em] text-sm transition-all ${proceedGlitch ? "animate-pulse" : ""}`}
                style={{
                  background: "linear-gradient(135deg, #8B0000, #4a0000)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  color: "#D4AF37",
                }}
              >
                Proceed →{" "}
                <span className={`text-red-400 text-xs ${proceedGlitch ? "opacity-100" : "opacity-60"}`}>
                  "The HouSe aLwayS wINs"
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="relative z-10 pt-20 pb-12 px-4 max-w-2xl mx-auto space-y-6">

        {/* Daily claim */}
        {canClaim && (
          <div className="border border-yellow-600/20 bg-yellow-600/5 p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-yellow-600/50 uppercase tracking-widest font-mono mb-1">
                Day {claimDay} Reward
              </div>
              <div className="text-sm font-bold text-white">
                {DAILY_REWARDS[(claimDay - 1) % 7].chips > 0 && `${DAILY_REWARDS[(claimDay - 1) % 7].chips} chips`}
                {DAILY_REWARDS[(claimDay - 1) % 7].mystery && " + Mystery Card"}
                {DAILY_REWARDS[(claimDay - 1) % 7].poker_face && " + 🃏 Poker Face"}
              </div>
            </div>
            <button
              onClick={handleDailyClaim}
              className="px-4 py-2 font-black text-xs uppercase tracking-wider transition-all hover:opacity-80"
              style={{ background: "linear-gradient(135deg, #D4AF37, #8B7000)", color: "#000" }}
            >
              Claim
            </button>
          </div>
        )}

        {/* Poker Face banner */}
        {clubUser?.poker_face_available && (
          <div className="border border-purple-500/30 bg-purple-500/5 p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-purple-400/70 uppercase tracking-widest font-mono mb-1">Poker Face Active</div>
              <div className="text-sm text-purple-300">Next shuffle — all cards revealed. Pick the one you need.</div>
            </div>
            <div className="text-2xl">🃏</div>
          </div>
        )}

        {/* Shuffle section */}
        <div className="border border-yellow-600/10 bg-black/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] text-yellow-600/50 uppercase tracking-widest font-mono">The Shuffle</div>
              <div className="text-lg font-black" style={{ color: "#D4AF37" }}>
                {canPick ? "🟢 Shuffle Active" : "⏳ Next Shuffle"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black tabular-nums font-mono" style={{ color: canPick ? "#4ade80" : "#D4AF37" }}>
                {formatTime(shuffleTimeLeft)}
              </div>
              <div className="text-[10px] text-gray-700 font-mono uppercase">10 chips · 1 pick per shuffle</div>
            </div>
          </div>

          {/* 6 card diamond layout */}
          <div className="grid grid-cols-4 gap-2 place-items-center mb-4">
            {DIAMOND_6.map((pos, idx) => (
              <div key={idx} style={{ gridColumn: pos.col + 1, gridRow: pos.row + 1 }}>
                {(clubUser?.poker_face_available && canPick) ? (
                  <FlippingCard
                    card={shuffleDeck[idx] || { rank: "A", suit: "♠" }}
                    onFlip={() => handleShuffleFlip(idx)}
                    flipped={shuffleFlipped[idx]}
                    disabled={shufflePicked || !canPick || (clubUser?.chips ?? 0) < 10}
                    size="small"
                  />
                ) : (
                  <CardBack
                    onClick={() => handleShuffleFlip(idx)}
                    disabled={shufflePicked || !canPick || (clubUser?.chips ?? 0) < 10}
                    size="small"
                  />
                )}
              </div>
            ))}
          </div>

          {shufflePicked && (
            <div className="text-center text-xs text-gray-600 font-mono uppercase tracking-wider">
              Pick used · Next shuffle in {formatTime(shuffleTimeLeft)}
            </div>
          )}
          {!canPick && !shufflePicked && (
            <div className="text-center text-xs text-gray-600 font-mono">
              Cards locked until next shuffle
            </div>
          )}
          {(clubUser?.chips ?? 0) < 10 && (
            <div className="text-center text-xs text-red-400/60 font-mono mt-1">
              Not enough chips (need 10)
            </div>
          )}
        </div>

        {/* Your Hand */}
        <div className="border border-yellow-600/10 bg-black/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] text-yellow-600/50 uppercase tracking-widest font-mono">Your Hand</div>
              <div className="text-lg font-black text-white">{playerHand.length} cards</div>
            </div>
            <Link href="/club/hands">
              <button className="text-xs font-mono uppercase tracking-wider text-yellow-600/50 hover:text-yellow-500 transition-colors border border-yellow-600/20 px-3 py-1.5">
                Show Hands →
              </button>
            </Link>
          </div>

          {playerHand.length === 0 ? (
            <div className="text-center py-8 text-gray-700 text-sm font-mono">
              No cards yet. Start picking from the shuffle.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {playerHand.slice(0, 10).map((c) => (
                <CardFront key={c.id} card={{ rank: c.card_rank as Rank, suit: c.card_suit as Suit }} size="small" />
              ))}
              {playerHand.length > 10 && (
                <div className="w-16 h-24 border border-yellow-600/10 flex items-center justify-center text-xs text-gray-600 font-mono">
                  +{playerHand.length - 10}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/club/board", label: "Leaderboard", sub: "Top 500 survive", icon: "🏆" },
            { href: "/club/deck", label: "The Deck", sub: "Buy & sell cards", icon: "🃏" },
            { href: "/club/hands", label: "Show Hands", sub: "Submit your wallet", icon: "🦊" },
            { href: "/club/how", label: "How To Play", sub: "Full guide", icon: "📖" },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <div className="border border-yellow-600/10 bg-black/40 p-4 hover:border-yellow-600/30 hover:bg-yellow-600/5 transition-all cursor-pointer">
                <div className="text-xl mb-2">{item.icon}</div>
                <div className="text-sm font-black text-white uppercase tracking-wide">{item.label}</div>
                <div className="text-[11px] text-gray-600 font-mono mt-0.5">{item.sub}</div>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}
