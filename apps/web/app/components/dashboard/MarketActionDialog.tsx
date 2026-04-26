"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";
import type { CategoryId } from "./CategoryFilterBar";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

type MarketActionMode = "create" | "request";

interface MarketActionDialogProps {
  isOpen: boolean;
  mode: MarketActionMode;
  onClose: () => void;
  onSuccess?: () => void;
}

interface MarketRequest {
  id: number;
  title: string;
  description: string;
  category: string;
  end_time: string;
  requested_by: string;
  created_at: string;
}

const categories: Exclude<CategoryId, "ALL">[] = [
  "TECH",
  "SPORTS",
  "CRYPTO",
  "CAMPUS",
];

const initialForm = {
  title: "",
  description: "",
  endTime: "",
  category: "CAMPUS" as Exclude<CategoryId, "ALL">,
  initialPool: "100",
};

export function MarketActionDialog({
  isOpen,
  mode,
  onClose,
  onSuccess,
}: MarketActionDialogProps) {
  const { getToken } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<MarketRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const isCreate = mode === "create";
  const title = isCreate ? "Create Market" : "Request Market";
  const actionText = isCreate ? "Create Market" : "Submit Request";

  const fetchRequests = async () => {
    if (!isCreate) return;
    setRequestsLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${BACKEND}/bet/requests?status=PENDING`, {
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
        },
        cache: "no-store",
      });
      if (!response.ok) return;
      const data = (await response.json()) as MarketRequest[];
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch market requests:", err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isCreate) {
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isCreate]);

  if (!isOpen) return null;

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    if (submitting) return;
    setForm(initialForm);
    setError("");
    setSuccess("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.endTime) {
      setError("Title, description, and end time are required.");
      return;
    }

    const endDate = new Date(form.endTime);
    if (Number.isNaN(endDate.getTime()) || endDate <= new Date()) {
      setError("Choose a valid future end time.");
      return;
    }

    const initialPool = Number(form.initialPool);
    if (!Number.isFinite(initialPool) || initialPool <= 0) {
      setError("Initial pool must be a positive number.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = await getToken();
      const response = await fetch(
        `${BACKEND}${isCreate ? "/bet/create" : "/bet/requests"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token ?? ""}`,
          },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim(),
            end_time: endDate.toISOString(),
            category: form.category,
            initial_pool: initialPool,
          }),
        },
      );

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error || "Something went wrong.");
      }

      setSuccess(
        isCreate
          ? `Market created successfully. Bet ID: ${body.bet_id}`
          : "Request submitted. An admin can approve it later.",
      );
      setForm(initialForm);
      if (isCreate) {
        fetchRequests();
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    setApprovingId(requestId);
    setError("");
    setSuccess("");

    try {
      const token = await getToken();
      const response = await fetch(
        `${BACKEND}/bet/requests/${requestId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token ?? ""}`,
          },
        },
      );
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error || "Failed to approve request.");
      }

      setSuccess(`Request approved. Bet ID: ${body.bet_id}`);
      setRequests((current) =>
        current.filter((request) => request.id !== requestId),
      );
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-void bg-opacity-80 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <section className="w-full max-w-2xl pointer-events-auto rounded-lg border border-surface-variant bg-surface-low shadow-ambient overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-surface-variant p-5">
            <div>
              <p className="label-sm text-primary mb-1">
                {isCreate ? "ADMIN ACTION" : "COMMUNITY REQUEST"}
              </p>
              <h2 className="title-lg text-on-surface">{title}</h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-lg text-on-variant hover:text-on-surface hover:bg-surface-high transition-colors"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <Field label="Market title">
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Will Nagpur cross 46°C this summer?"
                className="field-input"
              />
            </Field>

            <Field label="Details">
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Add context, rules, and what should count as resolution."
                rows={4}
                className="field-input resize-none"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Category">
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  className="field-input"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="End time">
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(event) =>
                    updateField("endTime", event.target.value)
                  }
                  className="field-input"
                />
              </Field>

              <Field label="Initial pool">
                <input
                  type="number"
                  min="1"
                  value={form.initialPool}
                  onChange={(event) =>
                    updateField("initialPool", event.target.value)
                  }
                  className="field-input"
                />
              </Field>
            </div>

            {(error || success) && (
              <div
                className={cn(
                  "rounded-lg border px-4 py-3 text-sm",
                  error
                    ? "border-error text-error bg-error bg-opacity-10"
                    : "border-secondary text-secondary bg-secondary bg-opacity-10",
                )}
              >
                {error || success}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : actionText}
              </Button>
            </div>

            {isCreate && (
              <div className="border-t border-surface-variant pt-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="label-sm text-primary mb-1">
                      PENDING REQUESTS
                    </p>
                    <h3 className="title-sm text-on-surface">
                      Community market ideas
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={fetchRequests}
                    className="text-sm text-primary hover:text-primary-container transition-colors"
                  >
                    Refresh
                  </button>
                </div>

                {requestsLoading ? (
                  <div className="h-20 rounded-lg bg-surface-high animate-pulse" />
                ) : requests.length === 0 ? (
                  <p className="body-sm text-on-variant">
                    No pending market requests.
                  </p>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className="rounded-lg bg-surface-high p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="title-sm text-on-surface">
                              {request.title}
                            </p>
                            <p className="body-sm mt-1 line-clamp-2">
                              {request.description}
                            </p>
                            <p className="text-xs text-on-variant mt-2">
                              {request.category} · requested by{" "}
                              {request.requested_by || "Anonymous"} · ends{" "}
                              {new Date(request.end_time).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="yes"
                            onClick={() => handleApprove(request.id)}
                            disabled={approvingId === request.id}
                          >
                            {approvingId === request.id
                              ? "Approving..."
                              : "Approve"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label-sm text-on-variant mb-2 block">{label}</span>
      {children}
    </label>
  );
}
