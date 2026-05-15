import { useState, useEffect } from "react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { useClubAuth } from "@/hooks/use-club-auth";
import { ArrowLeft, Tag, ShoppingCart } from "lucide-react";

const SUIT_COLOR: Record<string, string> = {
  "♠": "#1e293b", "♣": "#1e293b",
  "♥": "#ef4444", "♦": "#ef4444",
};

interface Listing {
  id: string;
  card_rank: string;
  card_suit: string;
  price: number;
  seller_id: string;
  seller_username?: string;
}

interface PlayerCard { id: string; card_rank: string; card_suit: string; }

export default function Deck() {
  const { clubUser, refreshUser } = useClubAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [myCards, setMyCards] = useState<PlayerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"browse" | "list">("browse");
  const [listPrice, setListPrice] = useState("");
  const [listCard, setListCard] = useState<string>("");
  const [listing, setListing] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchListings();
    if (clubUser) fetchMyCards();
  }, [clubUser]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("deck_listings")
        .select("id, card_rank, card_suit, price, seller_id")
        .eq("is_sold", false)
        .order("created_at", { ascending: false });

      if (data) {
        const enriched = await Promise.all(data.map(async (l) => {
          const { data: seller } = await supabase
            .from("users")
            .select("x_username")
            .eq("id", l.seller_id)
            .single();
          return { ...l, seller_username: seller?.x_username };
        }));
        setListings(enriched);
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const fetchMyCards = async () => {
    const { data } = await supabase
      .from("player_cards")
      .select("id, card_rank, card_suit")
      .eq("user_id", clubUser!.id)
      .eq("listed_on_deck", false);
    if (data) setMyCards(data);
  };

  const handleList = async () => {
    if (!listCard || !listPrice || !clubUser) return;
    const price = parseInt(listPrice);
    if (isNaN(price) || price < 1) { setMsg("Enter a valid chip price."); return; }

    setListing(true);
    setMsg("");
    try {
      const card = myCards.find(c => c.id === listCard);
      if (!card) return;

      const { data: newListing } = await supabase.from("deck_listings").insert({
        seller_id: clubUser.id,
        card_id: card.id,
        card_rank: card.card_rank,
        card_suit: card.card_suit,
        price,
      }).select().single();

      await supabase.from("player_cards").update({ listed_on_deck: true, deck_price: price }).eq("id", card.id);

      setMsg("Card listed successfully!");
      setListCard("");
      setListPrice("");
      fetchListings();
      fetchMyCards();
    } catch {
      setMsg("Failed to list card. Try again.");
    } finally {
      setListing(false);
    }
  };

  const handleBuy = async (listing: Listing) => {
    if (!clubUser) return;
    if (listing.seller_id === clubUser.id) { setMsg("Can't buy your own listing."); return; }
    if ((clubUser.chips ?? 0) < listing.price) { setMsg("Not enough chips."); return; }

    setBuying(listing.id);
    setMsg("");
    try {
      // Transfer chips
      await supabase.from("users").update({ chips: clubUser.chips - listing.price }).eq("id", clubUser.id);
      await supabase.rpc("add_chips", { user_id: listing.seller_id, amount: listing.price });

      // Transfer card
      await supabase.from("player_cards").update({
        user_id: clubUser.id,
        listed_on_deck: false,
        deck_price: null,
      }).eq("id", listing.id);

      // Mark sold
      await supabase.from("deck_listings").update({
        is_sold: true,
        buyer_id: clubUser.id,
      }).eq("id", listing.id);

      await supabase.from("activity_feed").insert({
        x_username: clubUser.x_username,
        event_type: "deck_purchase",
        message: `@${clubUser.x_username} bought ${listing.card_rank}${listing.card_suit} for ${listing.price} chips.`,
      });

      setMsg(`You got ${listing.card_rank}${listing.card_suit}!`);
      refreshUser();
      fetchListings();
    } catch {
      setMsg("Purchase failed. Try again.");
    } finally {
      setBuying(null);
    }
  };

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
        <span className="font-black tracking-widest text-sm" style={{ color: "#D4AF37" }}>THE DECK</span>
        <div className="text-xs text-gray-600 font-mono">{clubUser?.chips ?? 0} chips</div>
      </nav>

      <main className="relative z-10 pt-20 pb-12 px-4 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.3em] text-yellow-600/40 uppercase font-mono mb-2">Card Market</p>
          <h1 className="text-4xl font-black uppercase" style={{ color: "#D4AF37" }}>The Deck</h1>
          <p className="text-xs text-gray-600 font-mono mt-2">Trade cards with other players. Complete your hand.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-px bg-yellow-600/10 border border-yellow-600/10 mb-6">
          {(["browse", "list"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs uppercase tracking-widest font-mono transition-colors ${
                tab === t ? "bg-yellow-600/10 text-yellow-500" : "text-gray-600 hover:text-gray-400"
              }`}>
              {t === "browse" ? "Browse Listings" : "List a Card"}
            </button>
          ))}
        </div>

        {msg && (
          <div className={`border px-4 py-3 text-xs font-mono mb-4 ${
            msg.includes("success") || msg.includes("got")
              ? "border-green-500/20 bg-green-500/5 text-green-400"
              : "border-red-500/20 bg-red-500/5 text-red-400"
          }`}>
            {msg}
          </div>
        )}

        {/* Browse */}
        {tab === "browse" && (
          <div>
            {loading && (
              <div className="py-16 text-center">
                <div className="text-yellow-600/30 text-2xl animate-pulse">♦</div>
              </div>
            )}

            {!loading && listings.length === 0 && (
              <div className="py-16 text-center">
                <div className="text-3xl mb-3">🃏</div>
                <div className="text-xs text-gray-700 font-mono uppercase tracking-wider">No cards listed yet.</div>
                <div className="text-[11px] text-gray-700 font-mono mt-1">Be the first to list a card.</div>
              </div>
            )}

            <div className="space-y-2">
              {listings.map(l => {
                const color = SUIT_COLOR[l.card_suit] || "#e2e8f0";
                const isOwn = l.seller_id === clubUser?.id;
                const canAfford = (clubUser?.chips ?? 0) >= l.price;

                return (
                  <div key={l.id} className="flex items-center gap-4 border border-yellow-600/10 bg-black/40 px-4 py-3">
                    {/* Mini card */}
                    <div className="w-10 h-14 bg-white rounded-sm flex flex-col p-1 shrink-0">
                      <div className="text-xs font-black leading-none" style={{ color: color === "#1e293b" ? "#000" : color }}>{l.card_rank}</div>
                      <div className="text-xs leading-none" style={{ color: color === "#1e293b" ? "#000" : color }}>{l.card_suit}</div>
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-lg font-black" style={{ color: color === "#1e293b" ? "#000" : color }}>{l.card_suit}</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-black text-white text-sm">{l.card_rank}{l.card_suit}</div>
                      <div className="text-[10px] text-gray-600 font-mono">@{l.seller_username ?? "unknown"}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-sm" style={{ color: "#D4AF37", fontFamily: "Georgia" }}>
                        {l.price} chips
                      </div>
                      {!isOwn && (
                        <button
                          onClick={() => handleBuy(l)}
                          disabled={buying === l.id || !canAfford}
                          className="mt-1 text-[10px] font-mono uppercase tracking-wider px-3 py-1 border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" }}
                        >
                          {buying === l.id ? "..." : canAfford ? "Buy" : "Need chips"}
                        </button>
                      )}
                      {isOwn && (
                        <div className="text-[10px] text-gray-600 font-mono mt-1">Your listing</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List */}
        {tab === "list" && (
          <div className="border border-yellow-600/10 bg-black/40 p-5">
            <div className="text-[10px] text-yellow-600/40 uppercase tracking-widest font-mono mb-4">List a Card</div>

            {myCards.length === 0 ? (
              <div className="text-center py-8 text-gray-700 text-sm font-mono">
                No unlisted cards in hand.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] text-gray-600 uppercase tracking-widest font-mono mb-2">Select Card</div>
                  <div className="flex flex-wrap gap-2">
                    {myCards.map(c => {
                      const color = SUIT_COLOR[c.card_suit] || "#e2e8f0";
                      const displayColor = color === "#1e293b" ? "#000" : color;
                      const isSelected = listCard === c.id;
                      return (
                        <button key={c.id} onClick={() => setListCard(c.id)}
                          className={`w-12 h-16 bg-white rounded-sm flex flex-col p-1 transition-all ${
                            isSelected ? "ring-2 ring-yellow-500 scale-105" : "opacity-60 hover:opacity-90"
                          }`}>
                          <div className="text-[10px] font-black leading-none" style={{ color: displayColor }}>{c.card_rank}</div>
                          <div className="text-[10px] leading-none" style={{ color: displayColor }}>{c.card_suit}</div>
                          <div className="flex-1 flex items-center justify-center">
                            <span className="text-base font-black" style={{ color: displayColor }}>{c.card_suit}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-gray-600 uppercase tracking-widest font-mono mb-2">Listing Price (chips)</div>
                  <input
                    type="number"
                    value={listPrice}
                    onChange={e => setListPrice(e.target.value)}
                    placeholder="e.g. 150"
                    min={1}
                    className="w-full bg-black/60 border border-yellow-600/20 text-white text-sm font-mono py-3 px-4 placeholder-gray-700 focus:outline-none focus:border-yellow-600/40 transition-colors"
                  />
                </div>

                <button
                  onClick={handleList}
                  disabled={listing || !listCard || !listPrice}
                  className="w-full py-4 font-black uppercase tracking-[0.2em] text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #8B0000, #4a0000)",
                    border: "1px solid rgba(212,175,55,0.3)",
                    color: "#D4AF37",
                  }}
                >
                  {listing ? "Listing..." : "List on the Deck"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
