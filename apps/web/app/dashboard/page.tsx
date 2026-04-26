"use client";

import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { MarketCard } from "../components/dashboard/MarketCard";
import {
  CategoryFilterBar,
  type CategoryId,
} from "../components/dashboard/CategoryFilterBar";
import { RightPanel } from "../components/dashboard/RightPanel";
import { MarketActionDialog } from "../components/dashboard/MarketActionDialog";
import { Button } from "../components/ui/Button";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { formatWildCoins } from "../lib/currency";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

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

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [marketDialogOpen, setMarketDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = userRole === "ADMIN";

  const normalizeCategory = (category: string | null): CategoryId => {
    const normalized = (category ?? "ALL").toUpperCase();
    if (normalized === "ALL") return "ALL";
    if (normalized === "TECH") return "TECH";
    if (normalized === "SPORTS") return "SPORTS";
    if (normalized === "CRYPTO") return "CRYPTO";
    if (normalized === "CAMPUS") return "CAMPUS";
    return "ALL";
  };

  useEffect(() => {
    setSelectedCategory(normalizeCategory(searchParams.get("category")));
  }, [searchParams]);

  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true);
      setError(null);
      try {
        const url =
          selectedCategory === "ALL"
            ? `${BACKEND}/bet/markets`
            : `${BACKEND}/bet/markets?category=${selectedCategory}`;
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.error || "Failed to fetch markets");
        }
        const data = (await response.json()) as Market[];
        setMarkets(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch markets";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [selectedCategory, refreshKey]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!isSignedIn) {
        setUserRole(null);
        setRoleLoading(false);
        return;
      }

      setRoleLoading(true);
      try {
        const token = await getToken();

        const adminProbe = await fetch(
          `${BACKEND}/bet/requests?status=PENDING`,
          {
            headers: {
              Authorization: `Bearer ${token ?? ""}`,
            },
            cache: "no-store",
          },
        );
        if (adminProbe.ok) {
          setUserRole("ADMIN");
          return;
        }

        const balanceResponse = await fetch(`${BACKEND}/user/balance`, {
          headers: {
            Authorization: `Bearer ${token ?? ""}`,
          },
          cache: "no-store",
        });
        if (!balanceResponse.ok) {
          return;
        }
        const data = (await balanceResponse.json()) as { role?: string };
        setUserRole((data.role ?? null)?.toUpperCase() ?? null);
      } catch (err) {
        console.error("Failed to fetch user role:", err);
      } finally {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [getToken, isSignedIn]);

  const handleCategoryChange = (category: CategoryId) => {
    setSelectedCategory(category);
    if (category === "ALL") {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard?category=${category.toLowerCase()}`);
    }
  };

  const filteredMarkets = markets.filter((market) => {
    if (searchQuery.trim() === "") {
      return true;
    }
    return market.question.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout rightPanel={<RightPanel />}>
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
          <Button
            variant="primary"
            className="hidden md:flex"
            onClick={() => setMarketDialogOpen(true)}
            disabled={roleLoading}
          >
            {roleLoading
              ? "Checking Access..."
              : isAdmin
                ? "Create Market"
                : "Request Market"}
          </Button>
        </div>

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

        <CategoryFilterBar
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      <div className="md:hidden mb-6">
        <Button
          variant="primary"
          fullWidth
          onClick={() => setMarketDialogOpen(true)}
          disabled={roleLoading}
        >
          {roleLoading
            ? "Checking Access..."
            : isAdmin
              ? "Create Market"
              : "Request Market"}
        </Button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-64 rounded-2xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="col-span-full text-center py-12">
          <p className="text-on-variant">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
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
                      ease: "easeOut",
                    },
                  },
                }}
              >
                <MarketCard
                  id={market.id}
                  question={market.question}
                  category={market.category}
                  yesPrice={Math.round(market.yes_price)}
                  noPrice={Math.round(market.no_price)}
                  volume24h={formatWildCoins(market.volume)}
                  liquidity={formatWildCoins(market.pool_yes + market.pool_no)}
                  trending={market.trending}
                  endDate={market.end_time}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-on-variant">
                No markets found matching your filters.
              </p>
            </div>
          )}
        </motion.div>
      )}

      <MarketActionDialog
        isOpen={marketDialogOpen}
        mode={isAdmin ? "create" : "request"}
        onClose={() => setMarketDialogOpen(false)}
        onSuccess={() => setRefreshKey((current) => current + 1)}
      />
    </DashboardLayout>
  );
}

function DashboardPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout rightPanel={<RightPanel />}>
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-on-variant">Loading...</div>
          </div>
        </DashboardLayout>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

export default DashboardPage;
