"use client";

import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { MarketCard } from "../components/dashboard/MarketCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const MOCK_MARKETS = [
  {
    id: 1,
    question: "Will Bitcoin hit $100,000 before end of 2025?",
    category: "Crypto",
    yesPrice: 67,
    noPrice: 33,
    volume24h: "$24.5K",
    liquidity: "$120K",
    trending: true,
    endDate: "Dec 31, 2025",
  },
  {
    id: 2,
    question: "Will OpenAI release GPT-5 in Q2 2025?",
    category: "AI/Tech",
    yesPrice: 42,
    noPrice: 58,
    volume24h: "$18.2K",
    liquidity: "$95K",
    trending: true,
    endDate: "Jun 30, 2025",
  },
  {
    id: 3,
    question: "Will Trump win the 2028 US Presidential Election?",
    category: "Politics",
    yesPrice: 55,
    noPrice: 45,
    volume24h: "$32.1K",
    liquidity: "$180K",
    trending: false,
    endDate: "Nov 5, 2028",
  },
  {
    id: 4,
    question: "Will Tesla stock reach $500 by end of 2025?",
    category: "Stocks",
    yesPrice: 38,
    noPrice: 62,
    volume24h: "$15.8K",
    liquidity: "$72K",
    trending: false,
    endDate: "Dec 31, 2025",
  },
  {
    id: 5,
    question: "Will inflation drop below 2% in 2025?",
    category: "Economics",
    yesPrice: 28,
    noPrice: 72,
    volume24h: "$9.4K",
    liquidity: "$45K",
    trending: false,
    endDate: "Dec 31, 2025",
  },
  {
    id: 6,
    question: "Will SpaceX land humans on Mars by 2030?",
    category: "Space",
    yesPrice: 22,
    noPrice: 78,
    volume24h: "$11.2K",
    liquidity: "$58K",
    trending: false,
    endDate: "Dec 31, 2030",
  },
];

function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Hero Header with Asymmetric Layout */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="display-lg text-on-surface mb-2">
              Markets
            </h1>
            <p className="body-lg text-on-variant max-w-2xl">
              High-stakes forecasting. Real-time odds. Trade on the future.
            </p>
          </div>
          <Button variant="primary">
            Create Market
          </Button>
        </div>

        {/* Search + Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search markets..."
              variant="etched"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="primary">All</Badge>
            <Badge variant="outline">Crypto</Badge>
            <Badge variant="outline">Politics</Badge>
            <Badge variant="outline">AI/Tech</Badge>
            <Badge variant="outline">Sports</Badge>
          </div>
        </div>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {MOCK_MARKETS.map((market) => (
          <MarketCard
            key={market.id}
            question={market.question}
            category={market.category}
            yesPrice={market.yesPrice}
            noPrice={market.noPrice}
            volume24h={market.volume24h}
            liquidity={market.liquidity}
            trending={market.trending}
            endDate={market.endDate}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;