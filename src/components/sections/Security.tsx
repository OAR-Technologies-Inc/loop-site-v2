"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const securityPillars = [
  {
    title: "Seedless Authentication",
    description: "No seed phrases. Ever. Your biometrics (Face ID, Touch ID) secure your vault through device-native passkeys.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
      </svg>
    ),
  },
  {
    title: "Distributed Key Security",
    description: "Your keys are split across multiple parties using MPC. No single point of failure. Loop never holds a complete key.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
  },
  {
    title: "Hardware-Isolated Agents",
    description: "Agent code runs in AWS Nitro Enclaves — cryptographically isolated. Even Loop admins cannot access agent keys.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    title: "On-Chain Policy Enforcement",
    description: "Smart contracts enforce spending limits, time-locks, and approval thresholds. Agents operate within strict boundaries.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Verified Captures",
    description: "Value captures are cryptographically proven using zero-knowledge proofs. No trust required — mathematically verified.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Guaranteed Recovery",
    description: "Lost device? Designate guardians for social recovery. Passed away? Automatic inheritance to your designated heir.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
];

const guarantees = [
  { cant: "Access your funds", can: "View your public balance" },
  { cant: "Move your Cred", can: "Pause or revoke agent access" },
  { cant: "Fake capture rewards", can: "Extract all funds anytime" },
  { cant: "Change your settings", can: "Modify all vault settings" },
  { cant: "Prevent withdrawals", can: "Recover via guardians" },
  { cant: "Access enclave keys", can: "Verify agent code integrity" },
];

export function Security() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section id="security" ref={containerRef} className="relative py-24 bg-bg-base">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-forest-light text-sm font-medium tracking-wider uppercase mb-4 block">
            Security Architecture
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Self-Custody, Redefined
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Your agent operates 24/7. Your keys never leave your device. 
            We built Loop so that even we cannot access your funds.
          </p>
        </motion.div>

        {/* Security Pillars */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {securityPillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-bg-surface border border-border-subtle hover:border-forest/50 transition-colors"
            >
              <div className="text-forest-light mb-4">
                {pillar.icon}
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">
                {pillar.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Trust Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="rounded-3xl bg-bg-surface border border-border-subtle overflow-hidden"
        >
          <div className="p-8 md:p-12">
            <h3 className="font-display text-2xl font-bold mb-8 text-center">
              The Loop Security Guarantee
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* What Loop Cannot Do */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg">Loop Cannot</h4>
                </div>
                <ul className="space-y-3">
                  {guarantees.map((g, i) => (
                    <li key={i} className="flex items-center gap-3 text-text-muted">
                      <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>{g.cant}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What You Can Always Do */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-forest-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-lg">You Can Always</h4>
                </div>
                <ul className="space-y-3">
                  {guarantees.map((g, i) => (
                    <li key={i} className="flex items-center gap-3 text-text-muted">
                      <svg className="w-4 h-4 text-forest-light flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span>{g.can}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="px-8 md:px-12 py-6 bg-bg-elevated border-t border-border-subtle">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-forest-light" />
                  <span>Open Source</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold" />
                  <span>Audits Planned Q2 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-forest-light" />
                  <span>Solana Native</span>
                </div>
              </div>
              <a
                href="https://github.com/OAR-Technologies-Inc/loop-protocol/blob/master/docs/SECURITY-ARCHITECTURE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-forest-light hover:text-forest transition-colors flex items-center gap-2"
              >
                Read Full Security Documentation
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Technology Partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-text-muted mb-6">Security infrastructure powered by</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 text-text-muted">
            <div className="flex flex-col items-center gap-2">
              <span className="font-mono text-lg font-semibold text-text-secondary">Squads</span>
              <span className="text-xs">Policy Engine</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="font-mono text-lg font-semibold text-text-secondary">AWS Nitro</span>
              <span className="text-xs">Secure Enclaves</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="font-mono text-lg font-semibold text-text-secondary">Para</span>
              <span className="text-xs">Passkey Auth</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="font-mono text-lg font-semibold text-text-secondary">Reclaim</span>
              <span className="text-xs">ZK Proofs</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
