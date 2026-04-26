"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

/**
 * NotificationDropdown - Notification panel for AppHeader
 *
 * Features:
 * - Skeleton/placeholder notifications
 * - Slide-in animation
 * - Close on outside click
 * - Mark all as read functionality
 */

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const SKELETON_ITEMS = [1, 2, 3, 4];

export function NotificationDropdown({
  isOpen,
  onClose,
  className,
}: NotificationDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          {/* Dropdown Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)]",
              "bg-surface-high rounded-lg border border-surface-variant shadow-ambient z-50",
              "max-h-[32rem] overflow-hidden flex flex-col",
              className,
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-variant">
              <h3 className="title-sm text-on-surface">Notifications</h3>
              <button className="text-xs text-primary hover:text-primary-container transition-colors">
                Mark all as read
              </button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {SKELETON_ITEMS.map((item) => (
                <div key={item} className="p-4 border-b border-surface-variant">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-700 animate-pulse flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="h-3 w-28 bg-gray-700 rounded animate-pulse" />
                        <div className="h-2.5 w-12 bg-gray-700/80 rounded animate-pulse" />
                      </div>
                      <div className="h-2.5 w-full bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="h-2.5 w-4/5 bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-surface-variant bg-surface-low">
              <button className="w-full text-center text-sm text-primary hover:text-primary-container transition-colors">
                View all notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
