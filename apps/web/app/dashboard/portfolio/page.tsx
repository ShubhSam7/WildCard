"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { RightPanel } from "../../components/dashboard/RightPanel";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/utils";
import { formatWildCoins } from "../../lib/currency";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

interface PortfolioSummary {
  total_invested: number;
  total_value: number;
  total_pnl: number;
  total_pnl_percent: number;
  active_positions: number;
}

interface PortfolioPosition {
  id: number;
  market_id: number;
  question: string;
  position: "YES" | "NO";
  shares: number;
  avg_price: number;
  current_price: number;
  invested: number;
  current_value: number;
  pnl: number;
  pnl_percent: number;
  end_time: string;
}

interface PortfolioActivity {
  id: number;
  type: string;
  description: string;
  amount: number;
  market_id: number | null;
  market_title: string;
  created_at: string;
}

interface PortfolioResponse {
  summary: PortfolioSummary;
  positions: PortfolioPosition[];
  activities: PortfolioActivity[];
}

function PortfolioPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const response = await fetch(`${BACKEND}/user/portfolio`, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token ?? ""}`,
          },
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to fetch portfolio");
        }

        const payload = (await response.json()) as PortfolioResponse;
        setData(payload);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch portfolio";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [getToken]);

  const summary = data?.summary ?? {
    total_invested: 0,
    total_value: 0,
    total_pnl: 0,
    total_pnl_percent: 0,
    active_positions: 0,
  };

  const positions = data?.positions ?? [];
  const activities = data?.activities ?? [];

  return (
    <DashboardLayout rightPanel={<RightPanel />}>
      <div className="mb-8">
        <h1 className="display-lg text-on-surface mb-2">Portfolio</h1>
        <p className="body-lg text-on-variant max-w-2xl">
          Track your positions. Monitor performance. Maximize returns.
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-20 text-on-variant">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              label="TOTAL INVESTED"
              value={formatWildCoins(summary.total_invested)}
              variant="neutral"
            />
            <StatCard
              label="CURRENT VALUE"
              value={formatWildCoins(summary.total_value)}
              variant="neutral"
            />
            <StatCard
              label="TOTAL P&L"
              value={`${summary.total_pnl >= 0 ? "+" : ""}${formatWildCoins(summary.total_pnl)}`}
              subValue={`${summary.total_pnl >= 0 ? "+" : ""}${summary.total_pnl_percent.toFixed(2)}%`}
              variant={summary.total_pnl >= 0 ? "profit" : "loss"}
            />
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="title-lg text-on-surface">Active Positions</h2>
              <Badge variant="primary">
                {summary.active_positions} Positions
              </Badge>
            </div>

            {positions.length === 0 ? (
              <Card padding="asymmetric">
                <p className="body-md text-on-variant">
                  No active positions yet.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {positions.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="title-lg text-on-surface mb-6">Recent Activity</h2>
            {activities.length === 0 ? (
              <Card padding="asymmetric">
                <p className="body-md text-on-variant">
                  No recent activity found.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {activities.map((activity) => (
                  <TimelineItem
                    key={activity.id}
                    date={new Date(activity.created_at).toLocaleString()}
                    action={
                      activity.description || activity.type.replaceAll("_", " ")
                    }
                    market={activity.market_title || "Account activity"}
                    amount={formatActivityAmount(
                      activity.type,
                      activity.amount,
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function formatActivityAmount(type: string, amount: number) {
  if (type === "BET_PLACED") {
    return `-${formatWildCoins(amount)}`;
  }
  return `+${formatWildCoins(amount)}`;
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
          variant === "neutral" && "text-on-surface",
        )}
      >
        {value}
      </p>
      {subValue && (
        <p
          className={cn(
            "title-sm mt-1",
            variant === "profit" && "text-secondary",
            variant === "loss" && "text-error",
          )}
        >
          {subValue}
        </p>
      )}
    </Card>
  );
}

function PositionCard({ position }: { position: PortfolioPosition }) {
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
              {position.shares.toFixed(2)} shares @{" "}
              {position.avg_price.toFixed(2)}¢
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="label-sm text-on-variant mb-1">P&L</p>
          <p
            className={cn(
              "title-lg font-bold",
              isProfitable ? "text-secondary" : "text-error",
            )}
          >
            {isProfitable ? "+" : ""}
            {formatWildCoins(position.pnl)}
          </p>
          <p
            className={cn(
              "body-sm",
              isProfitable ? "text-secondary" : "text-error",
            )}
          >
            {isProfitable ? "+" : ""}
            {position.pnl_percent.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4">
        <div>
          <p className="label-sm text-on-variant mb-1">INVESTED</p>
          <p className="body-md text-on-surface">
            {formatWildCoins(position.invested)}
          </p>
        </div>
        <div>
          <p className="label-sm text-on-variant mb-1">CURRENT</p>
          <p className="body-md text-on-surface">
            {formatWildCoins(position.current_value)}
          </p>
        </div>
        <div>
          <p className="label-sm text-on-variant mb-1">PRICE</p>
          <p className="body-md text-on-surface">
            {position.current_price.toFixed(2)}¢
          </p>
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
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-primary" />
      </div>

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
