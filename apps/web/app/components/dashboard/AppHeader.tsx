"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Search, Bell, Menu, Coins } from "lucide-react";
import { cn } from "../../lib/utils";
import Link from "next/link";
import { formatWildCoins } from "../../lib/currency";
import { NotificationDropdown } from "./NotificationDropdown";

interface AppHeaderProps {
  onMobileMenuToggle?: () => void;
  className?: string;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

export function AppHeader({ onMobileMenuToggle, className }: AppHeaderProps) {
  const { getToken } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch user balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = await getToken();
        const response = await fetch(`${BACKEND}/user/balance`, {
          headers: {
            Authorization: `Bearer ${token ?? ""}`,
          },
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setBalance(data.wildCoins);
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
  }, [getToken]);

  // Keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-[#0e1a24]/80 backdrop-blur-md border-b border-white/10 px-4 md:px-6 py-3",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Logo + Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 hover:bg-surface-high rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-on-variant" />
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-on-primary font-grotesk font-bold text-lg">
                W
              </span>
            </div>
            <span className="hidden sm:block font-grotesk font-bold text-lg md:text-xl text-on-surface">
              WildCard
            </span>
          </Link>
        </div>

        {/* Center Section: Global Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div
            className={cn(
              "relative w-full transition-all duration-200",
              searchFocused && "scale-105",
            )}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-variant" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search markets..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                "w-full pl-10 pr-4 py-2 rounded-lg transition-all duration-200",
                "bg-surface-high border border-surface-variant",
                "text-on-surface placeholder:text-on-variant",
                "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
                "font-manrope text-sm",
              )}
            />
            {!searchFocused && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <kbd className="px-2 py-0.5 text-xs bg-surface-low rounded border border-surface-variant text-on-variant">
                  ⌘K
                </kbd>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Balance + Notifications + User */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Balance Display */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-high rounded-lg border border-surface-variant hover:border-primary transition-colors">
            <Coins className="w-4 h-4 text-tertiary" />
            <div className="flex flex-col">
              <span className="text-xs text-on-variant leading-none">
                Balance
              </span>
              <span className="text-sm font-bold text-primary font-manrope leading-none mt-0.5">
                {balanceLoading
                  ? "..."
                  : balance !== null
                    ? formatWildCoins(balance)
                    : "Error"}
              </span>
            </div>
          </div>

          {/* Mobile Balance (icon only) */}
          <button className="sm:hidden p-2 hover:bg-surface-high rounded-lg transition-colors relative">
            <Coins className="w-5 h-5 text-tertiary" />
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-surface-high rounded-lg transition-colors group"
            >
              <Bell className="w-5 h-5 text-on-variant group-hover:text-primary transition-colors" />
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full ring-2 ring-surface" />
            </button>

            {/* Notification Dropdown */}
            <NotificationDropdown
              isOpen={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
            />
          </div>

          {/* User Button */}
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox:
                  "w-9 h-9 rounded-full outline outline-2 outline-primary outline-opacity-30 hover:outline-opacity-60 transition-all",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
