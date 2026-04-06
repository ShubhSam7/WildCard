"use client";

import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { cn } from "../../lib/utils";

const MOCK_LEADERBOARD = [
  {
    rank: 1,
    username: "PredictionKing",
    avatar: "👑",
    totalProfit: 12450,
    winRate: 78.5,
    totalTrades: 342,
    streak: 12,
  },
  {
    rank: 2,
    username: "MarketWhale",
    avatar: "🐋",
    totalProfit: 9820,
    winRate: 72.3,
    totalTrades: 289,
    streak: 8,
  },
  {
    rank: 3,
    username: "CryptoOracle",
    avatar: "🔮",
    totalProfit: 8340,
    winRate: 69.8,
    totalTrades: 256,
    streak: 5,
  },
  {
    rank: 4,
    username: "DataDriven",
    avatar: "📊",
    totalProfit: 7120,
    winRate: 68.2,
    totalTrades: 198,
    streak: 3,
  },
  {
    rank: 5,
    username: "TrendSpotter",
    avatar: "👁️",
    totalProfit: 6890,
    winRate: 67.1,
    totalTrades: 187,
    streak: 7,
  },
  {
    rank: 6,
    username: "SmartBets",
    avatar: "🎯",
    totalProfit: 5670,
    winRate: 65.5,
    totalTrades: 156,
    streak: 4,
  },
  {
    rank: 7,
    username: "AlphaSeeker",
    avatar: "⚡",
    totalProfit: 5120,
    winRate: 64.8,
    totalTrades: 142,
    streak: 2,
  },
  {
    rank: 8,
    username: "QuantMaster",
    avatar: "🧮",
    totalProfit: 4850,
    winRate: 63.2,
    totalTrades: 134,
    streak: 6,
  },
];

function LeaderboardPage() {
  return (
    <DashboardLayout>
      {/* Hero Header */}
      <div className="mb-8">
        <h1 className="display-lg text-on-surface mb-2">Leaderboard</h1>
        <p className="body-lg text-on-variant max-w-2xl">
          Top forecasters. Elite performance. Rise to the top.
        </p>
      </div>

      {/* Timeframe Filters */}
      <div className="flex items-center gap-3 mb-8">
        <Badge variant="primary" size="md">
          All Time
        </Badge>
        <Badge variant="outline" size="md">
          This Month
        </Badge>
        <Badge variant="outline" size="md">
          This Week
        </Badge>
        <Badge variant="outline" size="md">
          Today
        </Badge>
      </div>

      {/* Top 3 Spotlight - Asymmetric heights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {MOCK_LEADERBOARD.slice(0, 3).map((user, index) => (
          <TopUserCard
            key={user.rank}
            user={user}
            highlight={index === 0}
          />
        ))}
      </div>

      {/* Rest of Leaderboard */}
      <Card padding="none" surface="low">
        <div className="divide-y divide-surface-high divide-opacity-30">
          {MOCK_LEADERBOARD.slice(3).map((user) => (
            <UserRow key={user.rank} user={user} />
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}

function TopUserCard({
  user,
  highlight,
}: {
  user: typeof MOCK_LEADERBOARD[0];
  highlight: boolean;
}) {
  return (
    <Card
      surface={highlight ? "bright" : "high"}
      padding="asymmetric"
      className={cn(
        "text-center relative overflow-hidden",
        highlight && "outline outline-2 outline-primary outline-opacity-30"
      )}
    >
      {/* Trophy Badge */}
      {user.rank === 1 && (
        <div className="absolute top-4 right-4">
          <Badge variant="tertiary" size="sm">
            👑 CHAMPION
          </Badge>
        </div>
      )}

      {/* Rank */}
      <div className="mb-4">
        <p className="display-lg font-bold text-primary">#{user.rank}</p>
      </div>

      {/* Avatar */}
      <div className="w-20 h-20 mx-auto mb-4 bg-surface-low rounded-full flex items-center justify-center text-4xl">
        {user.avatar}
      </div>

      {/* Username */}
      <h3 className="title-lg text-on-surface mb-4">{user.username}</h3>

      {/* Stats Grid */}
      <div className="space-y-3">
        <StatRow
          label="TOTAL PROFIT"
          value={`$${user.totalProfit.toLocaleString()}`}
          highlight
        />
        <StatRow label="WIN RATE" value={`${user.winRate}%`} />
        <StatRow label="TRADES" value={user.totalTrades.toString()} />
        {user.streak > 0 && (
          <div className="pt-2">
            <Badge variant="secondary" size="sm">
              🔥 {user.streak} win streak
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}

function UserRow({ user }: { user: typeof MOCK_LEADERBOARD[0] }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-surface-high transition-all duration-200">
      {/* Rank + User */}
      <div className="flex items-center gap-4 flex-1">
        <p className="title-md font-bold text-on-variant w-8">#{user.rank}</p>
        <div className="w-12 h-12 bg-surface-high rounded-full flex items-center justify-center text-2xl">
          {user.avatar}
        </div>
        <div>
          <p className="title-sm text-on-surface">{user.username}</p>
          {user.streak > 0 && (
            <p className="label-sm text-secondary">
              🔥 {user.streak} streak
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-8">
        <div className="text-right">
          <p className="label-sm text-on-variant mb-1">PROFIT</p>
          <p className="title-sm text-secondary font-bold">
            ${user.totalProfit.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="label-sm text-on-variant mb-1">WIN RATE</p>
          <p className="title-sm text-on-surface">{user.winRate}%</p>
        </div>
        <div className="text-right">
          <p className="label-sm text-on-variant mb-1">TRADES</p>
          <p className="title-sm text-on-surface">{user.totalTrades}</p>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="label-sm text-on-variant">{label}</p>
      <p
        className={cn(
          "title-sm font-bold",
          highlight ? "text-secondary" : "text-on-surface"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default LeaderboardPage;
