import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { SpotlightSection } from "@/components/spotlight-section";
import { ProblemSection } from "@/components/problem-section";
import { BeforeAfterSection } from "@/components/before-after-section";
import { SolutionStepsSection } from "@/components/solution-steps-section";
import { ProductProofSection } from "@/components/product-proof-section";
import { CoverageStripSection } from "@/components/coverage-strip-section";
import { TargetFitSection } from "@/components/target-fit-section";
import { PricingSection } from "@/components/pricing-section";
import { FAQSection } from "@/components/faq-section";
import { PilotProofSection } from "@/components/pilot-proof-section";
import { FinalCTASection } from "@/components/final-cta-section";
import { Footer } from "@/components/footer";

export function App() {
  return (
    <div className="landing-shell relative min-h-screen overflow-x-clip bg-background">
      <div className="pointer-events-none absolute top-24 left-[-120px] h-[360px] w-[360px] rounded-full bg-brand-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-[34rem] right-[-140px] h-[420px] w-[420px] rounded-full bg-accent-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-[12%] top-[78rem] h-[260px] w-[260px] rounded-full bg-status-info/10 blur-3xl" />

      <Header />
      <main className="relative">
        <HeroSection />
        <SpotlightSection />
        <ProblemSection />
        <BeforeAfterSection />
        <SolutionStepsSection />
        <ProductProofSection />
        <CoverageStripSection />
        <TargetFitSection />
        <PricingSection />
        <PilotProofSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
