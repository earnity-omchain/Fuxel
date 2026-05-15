import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const SECTIONS = [
  {
    emoji: "🔑",
    title: "Getting In",
    steps: [
      "You need an access code to enter. Get one from someone already inside — each code works for 5 people.",
      "Once your code is verified, sign in with your X account.",
      "You start with 100 chips. Pick 3 cards from 9 face-down cards (10 chips each). You'll have 70 chips left.",
      "Your unique referral code is generated. Share it — you earn 50 chips for every person who joins with your code (max 5).",
    ],
  },
  {
    emoji: "🃏",
    title: "The Cards",
    steps: [
      "Cards are standard playing cards — A K Q J 10 9 8 7 6 5 4 3 2 across ♠ ♥ ♦ ♣.",
      "Cards are always face-down. You never know what you're picking until you flip.",
      "Some cards contain chips instead of a playing card (100 to 1000 chips).",
      "Cards can be traded on The Deck marketplace with other players.",
    ],
  },
  {
    emoji: "⏰",
    title: "The Shuffle",
    steps: [
      "Every 2 hours, 6 new face-down cards appear on your home page.",
      "You can open 1 card per shuffle cycle. It costs 10 chips.",
      "Miss a cycle — those cards are gone. New ones appear in the next shuffle.",
      "Build your hand card by card over multiple cycles.",
    ],
  },
  {
    emoji: "📅",
    title: "Daily Claims",
    steps: [
      "Day 1: 100 chips",
      "Day 2: 200 chips",
      "Day 3: Mystery card",
      "Day 4: 300 chips",
      "Day 5: Mystery card + 100 chips",
      "Day 6: 500 chips",
      "Day 7: 100 chips + 🃏 Poker Face",
    ],
  },
  {
    emoji: "🃏",
    title: "Poker Face",
    steps: [
      "The rarest daily reward — earned on Day 7.",
      "When active, the next shuffle shows all 6 cards face-up before you pick.",
      "You can see every card and choose exactly the one you need.",
      "One-time use per Poker Face earned.",
    ],
  },
  {
    emoji: "🏆",
    title: "How to Win",
    steps: [
      "Path 1 — Chip Balance: Stay in the top 500 by chip count when the game ends. Top 500 earn mint rights.",
      "Path 2 — Show Hands: Build a qualifying poker hand (any hand from Two Pair upwards) and submit it to the House. Submit your wallet on the Show Hands page.",
      "Both paths are valid. You can pursue both at the same time.",
      "The game ends when the countdown hits zero.",
    ],
  },
  {
    emoji: "♠",
    title: "Poker Hand Rankings",
    steps: [
      "👑 Royal Flush — A K Q J 10, same suit (rarest)",
      "🔥 Straight Flush — 5 consecutive, same suit",
      "💎 Four of a Kind — 4 cards same rank",
      "🏠 Full House — 3 of a kind + a pair",
      "♠ Flush — 5 cards same suit",
      "➡️ Straight — 5 consecutive cards",
      "3️⃣ Three of a Kind — 3 cards same rank",
      "2️⃣ Two Pair — 2 different pairs (minimum qualifying hand)",
    ],
  },
  {
    emoji: "💱",
    title: "The Deck (Marketplace)",
    steps: [
      "List any card from your hand on The Deck for a chip price you set.",
      "Other players can buy your listed cards using their chips.",
      "Use the marketplace to complete your hand — buy the card you're missing.",
      "Cards transfer instantly when purchased. Chips transfer to the seller.",
    ],
  },
];

export default function HowTo() {
  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
      <div className="fixed inset-0 opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 30%, #0d3b1e 0%, #000 70%)" }} />

      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 border-b border-yellow-600/10 bg-black/80 backdrop-blur-md">
        <Link href="/club/home">
          <button className="flex items-center gap-2 text-gray-500 hover:text-yellow-500 transition-colors text-xs uppercase tracking-widest font-mono">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        </Link>
        <span className="font-black tracking-widest text-sm" style={{ color: "#D4AF37" }}>HOW TO PLAY</span>
        <div />
      </nav>

      <main className="relative z-10 pt-20 pb-12 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[10px] tracking-[0.3em] text-yellow-600/40 uppercase font-mono mb-2">The Rules</p>
          <h1 className="text-4xl font-black uppercase mb-3" style={{ color: "#D4AF37" }}>How To Play</h1>
          <p className="text-sm text-gray-600 font-mono max-w-md mx-auto leading-relaxed">
            1,555 NFTs. The fox deals the cards. The house sets the rules. Only the sharpest survive.
          </p>
        </div>

        <div className="space-y-4">
          {SECTIONS.map((section, i) => (
            <div key={i} className="border border-yellow-600/10 bg-black/40">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-yellow-600/5">
                <span className="text-xl">{section.emoji}</span>
                <h2 className="font-black uppercase tracking-wide text-white text-sm">{section.title}</h2>
              </div>
              <div className="px-5 py-4 space-y-3">
                {section.steps.map((step, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <span className="text-yellow-600/30 font-mono text-xs mt-0.5 shrink-0">
                      {String(j + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm text-gray-400 leading-relaxed font-mono">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Golden rule */}
        <div className="mt-8 border border-yellow-600/20 bg-yellow-600/5 p-6 text-center">
          <div className="text-3xl mb-3">🦊</div>
          <p className="text-sm font-bold italic" style={{ color: "#D4AF37" }}>
            "The house always wins. But the sharpest players always find a way."
          </p>
          <p className="text-[10px] text-gray-600 font-mono mt-2 uppercase tracking-widest">— The Fox</p>
        </div>

        <div className="flex gap-3 mt-6">
          <Link href="/club/home" className="flex-1">
            <button className="w-full py-3 text-xs font-mono uppercase tracking-widest border border-yellow-600/20 text-yellow-600/50 hover:text-yellow-500 hover:border-yellow-600/40 transition-all">
              Back to Table
            </button>
          </Link>
          <Link href="/club/board" className="flex-1">
            <button className="w-full py-3 text-xs font-mono uppercase tracking-widest border border-yellow-600/20 text-yellow-600/50 hover:text-yellow-500 hover:border-yellow-600/40 transition-all">
              Leaderboard
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
