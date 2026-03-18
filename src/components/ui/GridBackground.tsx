"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function GridBackground() {
  const [mounted, setMounted] = useState(false);
  
  // Mouse position with spring smoothing
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* SVG Grid Pattern */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <pattern
            id="grid-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          </pattern>
          
          {/* Radial gradient mask that follows mouse */}
          <radialGradient id="grid-mask" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* Full grid (very subtle) */}
        <rect width="100%" height="100%" fill="url(#grid-pattern)" opacity="0.3" />
      </svg>

      {/* Mouse-follow illumination circle */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          left: smoothX,
          top: smoothY,
          x: "-50%",
          y: "-50%",
          background: `
            radial-gradient(
              circle,
              rgba(0, 255, 204, 0.03) 0%,
              transparent 50%
            )
          `,
        }}
      />

      {/* Mouse-follow grid illumination */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="mouse-mask">
            <motion.circle
              r="300"
              fill="url(#grid-mask)"
              style={{
                cx: smoothX,
                cy: smoothY,
              }}
            />
          </mask>
        </defs>
        
        <rect
          width="100%"
          height="100%"
          fill="url(#grid-pattern)"
          mask="url(#mouse-mask)"
          opacity="1"
        />
      </svg>
    </div>
  );
}
