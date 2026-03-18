"use client";

import { useRef, useState } from "react";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  spotlight?: boolean;
  hover?: boolean;
}

export function BentoCard({ 
  children, 
  className = "", 
  spotlight = true,
  hover = true 
}: BentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !spotlight) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`bento-card relative p-6 ${hover ? 'hover-glow' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {spotlight && isHovered && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: spotlightPos.x,
            top: spotlightPos.y,
            width: 300,
            height: 300,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(0, 255, 204, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function BentoGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bento-grid ${className}`}>
      {children}
    </div>
  );
}
