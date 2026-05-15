import { LandingNavbar } from "./components/LandingNavbar";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { MultiTenantSection } from "./components/MultiTenantSection";
import { SecuritySection } from "./components/SecuritySection";
import { LandingFooter } from "./components/LandingFooter";

export function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <MultiTenantSection />
        <SecuritySection />
      </main>
      <LandingFooter />
    </>
  );
}

export default LandingPage;
