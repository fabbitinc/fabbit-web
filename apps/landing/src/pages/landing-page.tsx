import { useEffect } from "react";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { ProblemSection } from "@/components/problem-section";
import { FeaturesSection } from "@/components/features-section";
import { WorkflowSection } from "@/components/workflow-section";
import { ComparisonSection } from "@/components/comparison-section";
import { StatsSection } from "@/components/stats-section";
import { PricingSection } from "@/components/pricing-section";
import { FaqSection } from "@/components/faq-section";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export function LandingPage() {
  useEffect(() => {
    const prev = document.documentElement.getAttribute("data-landing");
    document.documentElement.setAttribute("data-landing", "dark");
    return () => {
      if (prev) document.documentElement.setAttribute("data-landing", prev);
      else document.documentElement.removeAttribute("data-landing");
    };
  }, []);

  return (
    <div className="lp2 min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <WorkflowSection />
        <ComparisonSection />
        <StatsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
