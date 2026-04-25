"use client";

import CtaSection from "./cta-section";
import FeaturesSection from "./features-section";
import HeroSection from "./hero-section";
import LandingFooter from "./landing-footer";
import LandingNavbar from "./landing-navbar";
import NexaDemoSection from "./nexa-demo-section";
import PricingSection from "./pricing-section";
import TestimonialsSection from "./testimonials-section";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070709]">
      <LandingNavbar />
      <HeroSection />
      <NexaDemoSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
