"use client";

import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { MarketCard } from "../components/dashboard/MarketCard";
import { CategoryFilterBar, type CategoryId } from "../components/dashboard/CategoryFilterBar";
import { RightPanel } from "../components/dashboard/RightPanel";
import { Button } from "../components/ui/Button";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { formatWildCoins } from "../lib/currency";

const MOCK_MARKETS = [
  {
    id: 1,
    question: "Will Bitcoin hit $100,000 before end of 2025?",
    category: "Crypto",
    yesPrice: 67,
    noPrice: 33,
    volume24h: "24500",
    liquidity: "120000",
    trending: true,
    endDate: "Dec 31, 2025",
  },
  {
    id: 2,
    question: "Will OpenAI release GPT-5 in Q2 2025?",
    category: "Tech",
    yesPrice: 42,
    noPrice: 58,
    volume24h: "18200",
    liquidity: "95000",
    trending: true,
    endDate: "Jun 30, 2025",
  },
  {
    id: 3,
    question: "Will Trump win the 2028 US Presidential Election?",
    category: "Politics",
    yesPrice: 55,
    noPrice: 45,
    volume24h: "32100",
    liquidity: "180000",
    trending: false,
    endDate: "Nov 5, 2028",
  },
  {
    id: 4,
    question: "Will Tesla stock reach $500 by end of 2025?",
    category: "Stocks",
    yesPrice: 38,
    noPrice: 62,
    volume24h: "15800",
    liquidity: "72000",
    trending: false,
    endDate: "Dec 31, 2025",
  },
  {
    id: 5,
    question: "Will inflation drop below 2% in 2025?",
    category: "Economics",
    yesPrice: 28,
    noPrice: 72,
    volume24h: "9400",
    liquidity: "45000",
    trending: false,
    endDate: "Dec 31, 2025",
  },
  {
    id: 6,
    question: "Will SpaceX land humans on Mars by 2030?",
    category: "Space",
    yesPrice: 22,
    noPrice: 78,
    volume24h: "11200",
    liquidity: "58000",
    trending: false,
    endDate: "Dec 31, 2030",
  },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const normalizeCategory = (category: string | null): CategoryId => {
    const normalized = (category ?? "ALL").toUpperCase();
    if (normalized === "ALL") return "ALL";
    if (normalized === "TECH") return "TECH";
    if (normalized === "SPORTS") return "SPORTS";
    if (normalized === "CRYPTO") return "CRYPTO";
    if (normalized === "CAMPUS") return "CAMPUS";
    return "ALL";
  };

  // Reset category filter when navigating to dashboard
  useEffect(() => {
    setSelectedCategory(normalizeCategory(searchParams.get("category")));
  }, [searchParams]);

  const handleCategoryChange = (category: CategoryId) => {
    setSelectedCategory(category);
    // Update URL to reflect filter state
    if (category === "ALL") {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard?category=${category.toLowerCase()}`);
    }
  };

  // Filter markets based on category and search
  const filteredMarkets = (selectedCategory === "ALL" ? MOCK_MARKETS : MOCK_MARKETS.filter((market) =>
    market.category.toUpperCase() === selectedCategory
  )).filter((market) => {
    const matchesSearch = searchQuery === "" || 
      market.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout rightPanel={<RightPanel />}>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-grotesk font-bold text-on-surface mb-2">
              Markets
            </h1>
            <p className="text-sm md:text-base text-on-variant">
              High-stakes forecasting. Real-time odds. Trade on the future.
            </p>
          </div>
          <Button variant="primary" className="hidden md:flex">
            Create Market
          </Button>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-variant" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-high border border-surface-variant text-on-surface placeholder:text-on-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-manrope text-sm"
            />
          </div>
        </div>

        {/* Category Filter Bar */}
        <CategoryFilterBar
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Markets Grid - Responsive Grid Layout */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        {filteredMarkets.length > 0 ? (
          filteredMarkets.map((market) => (
            <motion.div
              key={market.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.3,
                    ease: "easeOut"
                  }
                }
              }}
            >
              <MarketCard
                id={market.id}
                question={market.question}
                category={market.category}
                yesPrice={market.yesPrice}
                noPrice={market.noPrice}
                volume24h={formatWildCoins(parseInt(market.volume24h))}
                liquidity={formatWildCoins(parseInt(market.liquidity))}
                trending={market.trending}
                endDate={market.endDate}
              />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-on-variant">No markets found matching your filters.</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

function DashboardPage() {
  return (
    <Suspense fallback={
      <DashboardLayout rightPanel={<RightPanel />}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-on-variant">Loading...</div>
        </div>
      </DashboardLayout>
    }>
      <DashboardContent />
    </Suspense>
  );
}

export default DashboardPage;
