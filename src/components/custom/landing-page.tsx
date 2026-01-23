import AdvancedFeaturesSection from "../landing/AdvancedFeaturesSection";
import CtaSection from "../landing/CtaSection";
import FooterSection from "../landing/FooterSection";
import HeroSection from "../landing/HeroSection";
import HowItWorksSection from "../landing/HowItWorksSection";
import LandingNav from "../landing/LandingNav";
import PricingSection from "../landing/PricingSection";
import ProblemSection from "../landing/ProblemSection";
import SegmentsSection from "../landing/SegmentsSection";
import SolutionSection from "../landing/SolutionSection";

const LandingPage = () => (
  <div className="h-[100dvh] overflow-y-auto overscroll-contain">
    <LandingNav />
    <HeroSection />
    <ProblemSection />
    <SolutionSection />
    <HowItWorksSection />
    <AdvancedFeaturesSection />
    <SegmentsSection />
    {/* <TestimonialsSection /> */}
    <PricingSection />
    <CtaSection />
    <FooterSection />
  </div>
);

export default LandingPage;
