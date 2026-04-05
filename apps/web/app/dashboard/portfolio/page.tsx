"use client";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";

const MOCK_POSITIONS = [
  {
    id: 1,
    question: "Will Bitcoin hit $100,000 before end of 2025?",
    position: "YES",
    shares: 250,
    avgPrice: 64,
    currentPrice: 67,
    invested: 160,
    currentValue: 167.5,
    pnl: 7.5,
    pnlPercent: 4.69,
  },
  {
    id: 2,
    question: "Will OpenAI release GPT-5 in Q2 2025?",
    position: "NO",
    shares: 180,
    avgPrice: 61,
    currentPrice: 58,
    invested: 109.8,
    currentValue: 104.4,
    pnl: -5.4,
    pnlPercent: -4.92,
  },
  {
    id: 3,
    question: "Will Tesla stock reach $500 by end of 2025?",
    position: "YES",
    shares: 320,
    avgPrice: 35,
    currentPrice: 38,
    invested: 112,
    currentValue: 121.6,
    pnl: 9.6,
    pnlPercent: 8.57,
  },
];

function PortfolioPage() {
  const totalInvested = MOCK_POSITIONS.reduce((sum, p) => sum + p.invested, 0);
  const totalValue = MOCK_POSITIONS.reduce((sum, p) => sum + p.currentValue, 0);
  const totalPnL = totalValue - totalInvested;
  const totalPnLPercent = (totalPnL / totalInvested) * 100;

  return (
    <DashboardLayout>
      {/* Hero Header */}
      <div className="mb-8">
        <h1 className="display-lg text-on-surface mb-2">Portfolio</h1>
        <p className="body-lg text-on-variant max-w-2xl">
          Track your positions. Monitor performance. Maximize returns.
        </p>
      </div>

      {/* Stats Overview - Using surface-bright for critical info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="TOTAL INVESTED"
          value={`$${totalInvested.toFixed(2)}`}
          variant="neutral"
        />
        <StatCard
          label="CURRENT VALUE"
          value={`$${totalValue.toFixed(2)}`}
          variant="neutral"
        />
        <StatCard
          label="TOTAL P&L"
          value={`${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}`}
          subValue={`${totalPnL >= 0 ? "+" : ""}${totalPnLPercent.toFixed(2)}%`}
          variant={totalPnL >= 0 ? "profit" : "loss"}
        />
      </div>

      {/* Active Positions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="title-lg text-on-surface">Active Positions</h2>
          <Badge variant="primary">
            {MOCK_POSITIONS.length} Positions
          </Badge>
        </div>

        <div className="space-y-4">
          {MOCK_POSITIONS.map((position) => (
            <PositionCard key={position.id} position={position} />
          ))}
        </div>
      </div>

      {/* Performance Timeline - No dividers, use spacing */}
      <div>
        <h2 className="title-lg text-on-surface mb-6">Recent Activity</h2>
        <div className="space-y-6">
          <TimelineItem
            date="2 hours ago"
            action="Bought 180 NO shares"
            market="Will OpenAI release GPT-5 in Q2 2025?"
            amount="-$109.80"
          />
          <TimelineItem
            date="1 day ago"
            action="Bought 250 YES shares"
            market="Will Bitcoin hit $100,000 before end of 2025?"
            amount="-$160.00"
          />
          <TimelineItem
            date="3 days ago"
            action="Sold 120 YES shares"
            market="Will Tesla stock reach $500 by end of 2025?"
            amount="+$48.60"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  subValue,
  variant,
}: {
  label: string;
  value: string;
  subValue?: string;
  variant: "neutral" | "profit" | "loss";
}) {
  return (
    <Card
      surface={variant === "neutral" ? "high" : "bright"}
      padding="asymmetric"
    >
      <p className="label-sm text-on-variant mb-2">{label}</p>
      <p
        className={cn(
          "display-md font-bold",
          variant === "profit" && "text-secondary",
          variant === "loss" && "text-error",
          variant === "neutral" && "text-on-surface"
        )}
      >
        {value}
      </p>
      {subValue && (
        <p
          className={cn(
            "title-sm mt-1",
            variant === "profit" && "text-secondary",
            variant === "loss" && "text-error"
          )}
        >
          {subValue}
        </p>
      )}
    </Card>
  );
}

function PositionCard({ position }: { position: typeof MOCK_POSITIONS[0] }) {
  const isProfitable = position.pnl >= 0;

  return (
    <Card hoverable padding="asymmetric">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Badge
            variant={position.position === "YES" ? "secondary" : "error"}
            size="sm"
            className="mb-2"
          >
            {position.position}
          </Badge>
          <h3 className="title-md text-on-surface mb-2">{position.question}</h3>
          <div className="flex items-center gap-4 text-on-variant">
            <span className="body-sm">
              {position.shares} shares @ {position.avgPrice}¢
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="label-sm text-on-variant mb-1">P&L</p>
          <p
            className={cn(
              "title-lg font-bold",
              isProfitable ? "text-secondary" : "text-error"
            )}
          >
            {isProfitable ? "+" : ""}${position.pnl.toFixed(2)}
          </p>
          <p
            className={cn(
              "body-sm",
              isProfitable ? "text-secondary" : "text-error"
            )}
          >
            {isProfitable ? "+" : ""}
            {position.pnlPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4">
        <div>
          <p className="label-sm text-on-variant mb-1">INVESTED</p>
          <p className="body-md text-on-surface">${position.invested}</p>
        </div>
        <div>
          <p className="label-sm text-on-variant mb-1">CURRENT</p>
          <p className="body-md text-on-surface">${position.currentValue}</p>
        </div>
        <div>
          <p className="label-sm text-on-variant mb-1">PRICE</p>
          <p className="body-md text-on-surface">{position.currentPrice}¢</p>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Button variant="secondary" size="sm" fullWidth>
          Add More
        </Button>
        <Button variant="secondary" size="sm" fullWidth>
          Sell Position
        </Button>
      </div>
    </Card>
  );
}

function TimelineItem({
  date,
  action,
  market,
  amount,
}: {
  date: string;
  action: string;
  market: string;
  amount: string;
}) {
  return (
    <div className="flex items-start gap-4">
      {/* Timeline dot - no line */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-2">
        <div className="flex items-center justify-between mb-1">
          <p className="body-md text-on-surface font-medium">{action}</p>
          <p className="body-md text-on-surface font-bold">{amount}</p>
        </div>
        <p className="body-sm text-on-variant mb-1">{market}</p>
        <p className="label-sm text-on-variant">{date}</p>
      </div>
    </div>
  );
}

export default PortfolioPage;
