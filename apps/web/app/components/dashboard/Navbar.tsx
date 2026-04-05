"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "../../lib/utils";
import { GlassPanel } from "../ui/GlassPanel";
import Link from "next/link";

/**
 * Navbar - Neon Noir Pulse Dashboard
 * 
 * Features:
 * - Glassmorphic floating bar
 * - Fixed position
 * - User balance + Clerk user button
 */

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 px-6 py-4", className)}>
      <GlassPanel blur="strong" className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-on-primary font-grotesk font-bold text-lg">W</span>
            </div>
            <span className="font-grotesk font-bold text-xl text-on-surface">
              WildCard
            </span>
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="/dashboard" label="Markets" />
            <NavLink href="/dashboard/portfolio" label="Portfolio" />
            <NavLink href="/dashboard/leaderboard" label="Leaderboard" />
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {/* Balance Display */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-bright rounded-lg">
              <span className="label-sm text-on-variant">BALANCE</span>
              <span className="title-md text-primary font-bold">$1,250</span>
            </div>

            {/* User Button */}
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10 rounded-full outline outline-2 outline-primary outline-opacity-30",
                },
              }}
            />
          </div>
        </div>
      </GlassPanel>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="label-md text-on-variant hover:text-primary transition-all duration-200 hover:scale-105"
    >
      {label}
    </Link>
  );
}
