"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { cn } from "../../lib/utils";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

interface LeaderboardEntry {
  rank: number;
  name: string;
  profile_image_url: string;
  wild_coins: number;
}

function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND}/leaderboard`)
      .then((r) => r.json())
      .then((data) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">Leaderboard</h1>
        <p className="text-gray-400 max-w-2xl">Top forecasters ranked by WildCoins balance.</p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No users yet. Sign up to claim your spot!</p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <>
          {/* Top 3 Spotlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {top3.map((user, index) => (
              <TopUserCard key={user.rank} user={user} highlight={index === 0} />
            ))}
          </div>

          {/* Rest of leaderboard */}
          {rest.length > 0 && (
            <Card padding="none" surface="low">
              <div className="divide-y divide-white/10">
                {rest.map((user) => (
                  <UserRow key={user.rank} user={user} />
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ user }: { user: LeaderboardEntry }) {
  if (user.profile_image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.profile_image_url}
        alt={user.name}
        className="w-full h-full object-cover rounded-full"
      />
    );
  }
  return (
    <span className="text-lg font-bold text-on-surface">{getInitials(user.name || "?")}</span>
  );
}

function TopUserCard({ user, highlight }: { user: LeaderboardEntry; highlight: boolean }) {
  return (
    <Card
      surface={highlight ? "bright" : "high"}
      padding="asymmetric"
      className={cn("text-center relative overflow-hidden", highlight && "outline outline-2 outline-primary outline-opacity-30")}
    >
      {user.rank === 1 && (
        <div className="absolute top-4 right-4">
          <Badge variant="tertiary" size="sm">👑 CHAMPION</Badge>
        </div>
      )}
      <div className="mb-4">
        <p className="text-4xl font-black text-primary">#{user.rank}</p>
      </div>
      <div className="w-20 h-20 mx-auto mb-4 bg-surface-low rounded-full flex items-center justify-center overflow-hidden">
        <Avatar user={user} />
      </div>
      <h3 className="text-lg font-bold text-on-surface mb-4">{user.name || "Anonymous"}</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-on-variant uppercase tracking-wider">WILDCOIN BALANCE</p>
          <p className="text-sm font-bold text-secondary">
            {user.wild_coins.toLocaleString()} WC
          </p>
        </div>
      </div>
    </Card>
  );
}

function UserRow({ user }: { user: LeaderboardEntry }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-all duration-200">
      <div className="flex items-center gap-4 flex-1">
        <p className="text-base font-bold text-on-variant w-8">#{user.rank}</p>
        <div className="w-12 h-12 bg-surface-high rounded-full flex items-center justify-center overflow-hidden">
          <Avatar user={user} />
        </div>
        <p className="font-semibold text-on-surface">{user.name || "Anonymous"}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-on-variant mb-1">WILDCOIN BALANCE</p>
        <p className="text-sm font-bold text-secondary">
          {user.wild_coins.toLocaleString()} WC
        </p>
      </div>
    </div>
  );
}

export default LeaderboardPage;
