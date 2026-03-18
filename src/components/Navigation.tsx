"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "./ui/Button";

const navLinks = [
  { label: "Protocol", href: "#protocol" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Tokenomics", href: "#tokenomics" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "SDK", href: "https://github.com/southerncory/loop-protocol/tree/main/sdk", external: true },
  { label: "Docs", href: "https://loop-whitepaper.vercel.app", external: true },
];

export function Navigation() {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(10, 15, 13, 0)", "rgba(10, 15, 13, 0.95)"]
  );
  const backdropBlur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(12px)"]);

  return (
    <motion.header
      style={{ backgroundColor, backdropFilter: backdropBlur }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-colors duration-300"
    >
      <nav className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              {/* Loop logo - abstract vault symbol */}
              <svg
                viewBox="0 0 40 40"
                fill="none"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="url(#logo-gradient)"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="10"
                  stroke="url(#logo-gradient)"
                  strokeWidth="2"
                  fill="none"
                  className="group-hover:scale-110 transition-transform origin-center"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="3"
                  fill="#D4AF37"
                  className="group-hover:scale-125 transition-transform origin-center"
                />
                <defs>
                  <linearGradient
                    id="logo-gradient"
                    x1="0"
                    y1="0"
                    x2="40"
                    y2="40"
                  >
                    <stop stopColor="#1B4D3E" />
                    <stop offset="1" stopColor="#2D7A5E" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Loop
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="text-text-secondary hover:text-text-primary transition-colors duration-200 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" href="https://app.looplocal.io">
              Launch App
            </Button>
            <Button variant="primary" size="sm" href="#waitlist">
              Join Waitlist
            </Button>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
