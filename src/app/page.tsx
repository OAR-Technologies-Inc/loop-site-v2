import { Navigation } from "@/components/Navigation";
import { ProductHero } from "@/components/sections/ProductHero";
import { LiveMarketplace } from "@/components/sections/LiveMarketplace";
import { LaunchAgentSection } from "@/components/sections/LaunchAgentSection";
import { TradingTeaser } from "@/components/sections/TradingTeaser";
import { Frameworks } from "@/components/sections/Frameworks";
import { CoreConcept } from "@/components/sections/CoreConcept";
import { CaptureLayers } from "@/components/sections/CaptureLayers";
import { ProtocolPillars } from "@/components/sections/ProtocolPillars";
import { Tokens } from "@/components/sections/Tokens";
import { Security } from "@/components/sections/Security";
import { Development } from "@/components/sections/Development";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        {/* NEW PRODUCT-FOCUSED SECTIONS */}
        <ProductHero />
        <LiveMarketplace />
        <LaunchAgentSection />
        <TradingTeaser />
        
        {/* FRAMEWORK INTEGRATIONS */}
        <Frameworks />
        
        {/* CORE VALUE PROP */}
        <CoreConcept />
        
        {/* 11 CAPTURE LAYERS - kept, moved lower */}
        <CaptureLayers />
        
        {/* FOUR PILLARS - kept exactly as-is, moved lower */}
        <ProtocolPillars />
        
        {/* TOKENOMICS */}
        <Tokens />
        
        {/* SECURITY */}
        <Security />
        
        {/* DEVELOPMENT/ROADMAP - update to show "3 programs live on mainnet" */}
        <Development />
      </main>
      <Footer />
    </>
  );
}
