"use client";

import { useEffect, useState } from "react";

import CtaSection from "./cta-section";
import FaqSection from "./faq-section";
import FeaturesSection from "./features-section";
import HeroSection from "./hero-section";
import LandingFooter from "./landing-footer";
import LandingNavbar from "./landing-navbar";
import MobileLandingPage from "./mobile-landing-page";
import { NexaCaptureWidget } from "./nexa-capture-widget";
import NexaDemoSection from "./nexa-demo-section";
import PricingSection from "./pricing-section";
import ProductProofSection from "./product-proof-section";
import TestimonialsSection from "./testimonials-section";

function DesktopLandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070709]">
      <LandingNavbar />
      <HeroSection />
      <ProductProofSection />
      <NexaDemoSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
      <NexaCaptureWidget />
    </main>
  );
}

export default function LandingPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) return <MobileLandingPage />;
  return <DesktopLandingPage />;
}
