"use client";

interface MetricProps {
  label: string;
  value: string | number;
  accent?: boolean;
  suffix?: string;
  prefix?: string;
  size?: "sm" | "md" | "lg";
}

export function Metric({ 
  label, 
  value, 
  accent = false, 
  suffix, 
  prefix,
  size = "md" 
}: MetricProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className="metric">
      <div className={`metric-value ${sizeClasses[size]} ${accent ? 'metric-value-accent' : ''}`}>
        {prefix && <span className="text-text-muted">{prefix}</span>}
        {value}
        {suffix && <span className="text-text-muted text-[0.6em] ml-1">{suffix}</span>}
      </div>
      <span className="metric-label">{label}</span>
    </div>
  );
}

interface MetricRowProps {
  metrics: Array<{
    label: string;
    value: string | number;
    accent?: boolean;
    suffix?: string;
    prefix?: string;
  }>;
}

export function MetricRow({ metrics }: MetricRowProps) {
  return (
    <div className="flex gap-8">
      {metrics.map((metric, i) => (
        <Metric key={i} {...metric} size="sm" />
      ))}
    </div>
  );
}
