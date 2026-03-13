import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/sections/Hero";
import { CoreConcept } from "@/components/sections/CoreConcept";
import { ProtocolPillars } from "@/components/sections/ProtocolPillars";
import { Tokens } from "@/components/sections/Tokens";
import { ServiceAgents } from "@/components/sections/ServiceAgents";
import { Development } from "@/components/sections/Development";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <CoreConcept />
        <ProtocolPillars />
        <Tokens />
        <ServiceAgents />
        <Development />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
