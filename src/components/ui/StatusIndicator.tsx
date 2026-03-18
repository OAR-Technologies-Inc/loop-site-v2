"use client";

import { motion } from "framer-motion";

interface StatusIndicatorProps {
  status: "online" | "warning" | "error" | "offline";
  label?: string;
  showLabel?: boolean;
}

export function StatusIndicator({ status, label, showLabel = true }: StatusIndicatorProps) {
  const statusConfig = {
    online: { 
      color: "bg-positive", 
      shadow: "shadow-[0_0_10px_var(--positive)]",
      text: "Online", 
      textColor: "text-positive",
      animate: true,
      fast: false,
    },
    warning: { 
      color: "bg-warning", 
      shadow: "shadow-[0_0_10px_var(--warning)]",
      text: "Warning", 
      textColor: "text-warning",
      animate: true,
      fast: false,
    },
    error: { 
      color: "bg-negative", 
      shadow: "shadow-[0_0_10px_var(--negative)]",
      text: "Error", 
      textColor: "text-negative",
      animate: true,
      fast: true,
    },
    offline: { 
      color: "bg-zinc-600", 
      shadow: "",
      text: "Offline", 
      textColor: "text-text-muted",
      animate: false,
      fast: false,
    },
  };

  const config = statusConfig[status];
  const displayLabel = label || config.text;

  return (
    <div className="flex items-center gap-2">
      <motion.span
        className={`w-2 h-2 rounded-full ${config.color} ${config.shadow}`}
        animate={config.animate ? {
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        } : undefined}
        transition={config.animate ? {
          duration: config.fast ? 0.5 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        } : undefined}
      />
      {showLabel && (
        <span className={`label ${config.textColor}`}>{displayLabel}</span>
      )}
    </div>
  );
}

export function LiveBadge({ label = "Live" }: { label?: string }) {
  return (
    <span className="live-badge">
      <motion.span
        className="w-1.5 h-1.5 rounded-full bg-accent"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {label}
    </span>
  );
}
