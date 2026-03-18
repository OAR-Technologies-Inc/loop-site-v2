"use client";

interface StatusIndicatorProps {
  status: "online" | "warning" | "error" | "offline";
  label?: string;
  showLabel?: boolean;
}

export function StatusIndicator({ status, label, showLabel = true }: StatusIndicatorProps) {
  const statusConfig = {
    online: { dot: "status-dot", text: "Online", color: "text-positive" },
    warning: { dot: "status-dot-warning", text: "Warning", color: "text-warning" },
    error: { dot: "status-dot-error", text: "Error", color: "text-negative" },
    offline: { dot: "bg-zinc-600", text: "Offline", color: "text-text-muted" },
  };

  const config = statusConfig[status];
  const displayLabel = label || config.text;

  return (
    <div className="flex items-center gap-2">
      <span className={config.dot} />
      {showLabel && (
        <span className={`label ${config.color}`}>{displayLabel}</span>
      )}
    </div>
  );
}

export function LiveBadge({ label = "Live" }: { label?: string }) {
  return (
    <span className="live-badge">{label}</span>
  );
}
