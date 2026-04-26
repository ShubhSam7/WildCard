"use client";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { RightPanel } from "../../components/dashboard/RightPanel";
import { MarketHeader } from "../../components/bet/MarketHeader";
import { PriceChart } from "../../components/bet/PriceChart";
import { MarketRules } from "../../components/bet/MarketRules";
import { TradingWidget } from "../../components/bet/TradingWidget";
import { MarketDiscussion } from "../../components/bet/MarketDiscussion";
import { useParams } from "next/navigation";
import { formatWildCoins } from "../../lib/currency";

// Mock data - would come from API/database in production
const MOCK_MARKET = {
  id: 1,
  question: "Will a human land on Mars by the end of 2029?",
  category: "TECHNOLOGY",
  yesPrice: 64,
  noPrice: 36,
  volume24h: "12500",
  liquidity: "45000",
  endDate: "Dec 31, 2029",
  trending: true,
  currentProbability: 64,
  resolutionCriteria:
    "This market will resolve to YES if a human being physically sets foot on the surface of Mars before 11:59 PM UTC on December 31, 2029. The landing must be confirmed by at least two independent space agencies or reputable news organizations. A flyby, orbital mission, or robotic landing does not count.",
};

export default function BetDetailPage() {
  const params = useParams();
  const betId = params.bet_id as string;

  // In production, fetch market data based on betId
  const market = MOCK_MARKET;

  return (
    <DashboardLayout rightPanel={<RightPanel />}>
      <div className="space-y-6">
        {/* Market Header */}
        <MarketHeader
          question={market.question}
          category={market.category}
          endDate={market.endDate}
          trending={market.trending}
        />

        {/* Core betting widget pinned near top of details view */}
        <div className="max-w-xl">
          <TradingWidget
            betId={betId}
            yesPrice={market.yesPrice}
            noPrice={market.noPrice}
          />
        </div>

        {/* Market context content */}
        <div className="space-y-6">
          <PriceChart currentProbability={market.currentProbability} />
          <MarketRules
            resolutionCriteria={market.resolutionCriteria}
            volume24h={formatWildCoins(parseInt(market.volume24h))}
            liquidity={formatWildCoins(parseInt(market.liquidity))}
          />
        </div>

        {/* Discussion appears naturally as users scroll down */}
        <div className="pt-6">
          <div className="mx-auto max-w-[1200px]">
            <MarketDiscussion />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
