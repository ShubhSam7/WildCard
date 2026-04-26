"use client";

import React, { useState } from "react";
import { GlassPanel } from "../ui/GlassPanel";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { MessageSquare, ThumbsUp, Reply, User } from "lucide-react";

interface Comment {
  id: number;
  username: string;
  badge?: "TOP TRADER" | "EXPERT" | "NEW";
  time: string;
  text: string;
  likes: number;
  replies?: Comment[];
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    username: "CryptoWhale",
    badge: "TOP TRADER",
    time: "2h ago",
    text: "Based on recent developments in space technology and SpaceX's progress, I'm bullish on this market. The timeline seems aggressive but achievable with current trajectory.",
    likes: 24,
    replies: [
      {
        id: 2,
        username: "MarsEnthusiast",
        badge: "EXPERT",
        time: "1h ago",
        text: "I agree, but we should consider regulatory and funding challenges. Those could delay the mission significantly.",
        likes: 12,
      },
    ],
  },
  {
    id: 3,
    username: "DataDriven",
    badge: "EXPERT",
    time: "4h ago",
    text: "Looking at historical data on space missions, delays are common. I'm positioning for NO but keeping a small YES position as hedge.",
    likes: 18,
  },
  {
    id: 4,
    username: "NewTrader99",
    badge: "NEW",
    time: "6h ago",
    text: "First time betting on prediction markets. This seems like a fascinating question!",
    likes: 5,
  },
];

export function MarketDiscussion() {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);

  const handlePostComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      username: "You",
      time: "Just now",
      text: commentText,
      likes: 0,
    };

    setComments([newComment, ...comments]);
    setCommentText("");
  };

  const getBadgeVariant = (badge?: string) => {
    switch (badge) {
      case "TOP TRADER":
        return "success";
      case "EXPERT":
        return "primary";
      case "NEW":
        return "tertiary";
      default:
        return "tertiary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-on-surface">
          MARKET DISCUSSION
        </h2>
        <Badge variant="tertiary" size="sm" className="ml-auto">
          {comments.length} Comments
        </Badge>
      </div>

      {/* Comment Input */}
      <GlassPanel blur="normal" className="p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts on this market..."
              className="w-full bg-surface border border-surface-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-on-variant focus:outline-none focus:border-primary resize-none"
              rows={4}
            />
            <div className="flex justify-end mt-3">
              <Button
                variant="primary"
                onClick={handlePostComment}
                disabled={!commentText.trim()}
              >
                POST COMMENT
              </Button>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            getBadgeVariant={getBadgeVariant}
          />
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center">
        <Button variant="secondary" className="px-8">
          LOAD MORE COMMENTS
        </Button>
      </div>
    </div>
  );
}

function CommentCard({
  comment,
  getBadgeVariant,
  isReply = false,
}: {
  comment: Comment;
  getBadgeVariant: (badge?: string) => string;
  isReply?: boolean;
}) {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <GlassPanel blur="normal" className={`p-6 ${isReply ? "ml-12" : ""}`}>
      {/* Comment Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-on-surface">
              {comment.username}
            </span>
            {comment.badge && (
              <Badge
                variant={getBadgeVariant(comment.badge) as any}
                size="sm"
                className="text-xs"
              >
                {comment.badge}
              </Badge>
            )}
            <span className="text-xs text-on-variant ml-auto">
              {comment.time}
            </span>
          </div>
        </div>
      </div>

      {/* Comment Body */}
      <p className="text-sm text-on-surface leading-relaxed mb-4">
        {comment.text}
      </p>

      {/* Comment Actions */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 text-xs text-on-variant hover:text-primary transition-colors">
          <ThumbsUp className="w-4 h-4" />
          <span>{comment.likes}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-on-variant hover:text-primary transition-colors">
          <Reply className="w-4 h-4" />
          <span>Reply</span>
        </button>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-primary hover:underline mb-3"
          >
            {showReplies ? "Hide" : "Show"} {comment.replies.length}{" "}
            {comment.replies.length === 1 ? "reply" : "replies"}
          </button>
          {showReplies && (
            <div className="space-y-4">
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  getBadgeVariant={getBadgeVariant}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </GlassPanel>
  );
}
