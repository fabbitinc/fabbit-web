import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { SocialProofSection } from "@/components/social-proof-section";
import { ProblemSection } from "@/components/problem-section";
import { SolutionSection } from "@/components/solution-section";
import { BeforeAfterSection } from "@/components/before-after-section";
import { FeaturesSection } from "@/components/features-section";
import { ComparisonSection } from "@/components/comparison-section";
import { PricingSection } from "@/components/pricing-section";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { MobileStickyCta } from "@/components/mobile-sticky-cta";

export function LandingPage() {
  return (
    <div className="noise-overlay min-h-screen bg-[var(--lp-bg)] font-[DM_Sans,sans-serif] text-[var(--lp-text)]">
      <Header />
      <main>
        <HeroSection />
        <SocialProofSection />
        <ProblemSection />
        <SolutionSection />
        <BeforeAfterSection />
        <FeaturesSection />
        <ComparisonSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
      <MobileStickyCta />
    </div>
  );
}
