"use client";

import { useRef, useState, useCallback } from "react";

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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || !spotlight) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [spotlight]);

  return (
    <div
      ref={cardRef}
      className={`bento-card-v2 relative p-6 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        '--mouse-x': `${mousePos.x}px`,
        '--mouse-y': `${mousePos.y}px`,
      } as React.CSSProperties}
    >
      {/* Gradient border overlay */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border-gradient" />
      
      {/* Mouse-follow spotlight */}
      {spotlight && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
          style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s ease' }}
        >
          <div
            className="absolute"
            style={{
              left: mousePos.x,
              top: mousePos.y,
              width: 500,
              height: 500,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
        </div>
      )}
      
      {/* Content */}
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
