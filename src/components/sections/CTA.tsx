"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "../ui/Button";

export function CTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    
    // Placeholder - would integrate with actual waitlist API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStatus("success");
    setEmail("");
  };

  return (
    <section
      id="waitlist"
      ref={containerRef}
      className="relative py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-forest/5 to-bg-base" />
      
      {/* Mesh gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-forest/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Ready to Build{" "}
            <span className="gradient-text">Real Wealth</span>?
          </h2>
          <p className="text-xl text-text-secondary mb-12">
            Join the waitlist for early access. Be among the first to own your
            economic future.
          </p>

          {/* Waitlist Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === "loading" || status === "success"}
                className="flex-1 px-4 py-3 rounded-lg bg-bg-surface border border-border-default text-text-primary placeholder:text-text-muted focus:outline-none focus:border-forest transition-colors"
              />
              <Button
                variant="primary"
                onClick={() => {}}
                className={status === "loading" ? "opacity-70" : ""}
              >
                {status === "loading"
                  ? "..."
                  : status === "success"
                  ? "✓"
                  : "Join"}
              </Button>
            </div>
            {status === "success" && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm text-forest-light"
              >
                You&apos;re on the list. We&apos;ll be in touch.
              </motion.p>
            )}
          </form>

          {/* Social proof / links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 flex items-center justify-center gap-8"
          >
            <a
              href="https://docs.looplocal.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Read the Docs →
            </a>
            <a
              href="https://github.com/OAR-Technologies-Inc/loop-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              View on GitHub →
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
