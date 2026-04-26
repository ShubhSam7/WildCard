"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { MarketCard } from "../components/dashboard/MarketCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

const CATEGORIES = ["ALL", "TECH", "SPORTS", "CRYPTO", "CAMPUS"];

interface Market {
  id: number;
  question: string;
  category: string;
  yes_price: number;
  no_price: number;
  pool_yes: number;
  pool_no: number;
  volume: number;
  probability: number;
  end_time: string;
  status: string;
  trending: boolean;
}

function DashboardPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true);
      setError(null);
      try {
        const url =
          activeCategory === "ALL"
            ? `${BACKEND}/bet/markets`
            : `${BACKEND}/bet/markets?category=${activeCategory}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch markets");
        const data = await res.json();
        setMarkets(data);
      } catch (err) {
        setError("Could not load markets. Is the backend running?");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkets();
  }, [activeCategory]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Markets</h1>
            <p className="text-gray-400 max-w-2xl">
              High-stakes forecasting. Real-time odds. Trade on the future.
            </p>
          </div>
          <Button variant="primary">Create Market</Button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-[#a6a5f2] text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Markets Grid */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">😕 {error}</p>
        </div>
      )}

      {!loading && !error && markets.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No markets yet</p>
          <p className="text-sm">An admin needs to create the first market.</p>
        </div>
      )}

      {!loading && !error && markets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {markets.map((market) => (
            <MarketCard
              key={market.id}
              id={market.id}
              question={market.question}
              category={market.category}
              yesPrice={Math.round(market.yes_price)}
              noPrice={Math.round(market.no_price)}
              volume24h={`${(market.volume / 1000).toFixed(1)}k WC`}
              liquidity={`${((market.pool_yes + market.pool_no) / 1000).toFixed(1)}k WC`}
              trending={market.trending}
              endDate={market.end_time}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default DashboardPage;