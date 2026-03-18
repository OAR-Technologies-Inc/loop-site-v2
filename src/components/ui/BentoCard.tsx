"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  spotlight?: boolean;
  tilt?: boolean;
}

export function BentoCard({ 
  children, 
  className = "", 
  spotlight = true,
  tilt = true,
}: BentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position for spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D Tilt - spring physics for "heavy mechanical" feel
  const rotateX = useSpring(0, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Spotlight position (relative to card)
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);

    // Tilt calculation (relative to center, max 8 degrees)
    if (tilt) {
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);
      rotateY.set(deltaX * 8);
      rotateX.set(-deltaY * 8);
    }
  }, [mouseX, mouseY, rotateX, rotateY, tilt]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  // Transform spotlight position to CSS values
  const spotlightX = useTransform(mouseX, (v) => `${v}px`);
  const spotlightY = useTransform(mouseY, (v) => `${v}px`);

  return (
    <motion.div
      ref={cardRef}
      className={`bento-card-v2 relative p-6 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: tilt ? rotateX : 0,
        rotateY: tilt ? rotateY : 0,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Gradient border with shimmer */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border-gradient-shimmer" />
      
      {/* Mouse-follow spotlight */}
      {spotlight && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden"
          style={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              left: spotlightX,
              top: spotlightY,
              x: "-50%",
              y: "-50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
            }}
          />
        </motion.div>
      )}
      
      {/* Content with slight Z-lift on hover */}
      <motion.div 
        className="relative z-10"
        style={{ translateZ: tilt && isHovered ? 20 : 0 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function BentoGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bento-grid ${className}`}>
      {children}
    </div>
  );
}
