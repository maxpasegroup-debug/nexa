import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRoleRedirect } from "@/lib/role-redirect";
import CtaSection from "@/components/landing/cta-section";
import FaqSection from "@/components/landing/faq-section";
import FeaturesSection from "@/components/landing/features-section";
import HeroSection from "@/components/landing/hero-section";
import LandingFooter from "@/components/landing/landing-footer";
import LandingNavbar from "@/components/landing/landing-navbar";
import { NexaCaptureWidget } from "@/components/landing/nexa-capture-widget";
import NexaDemoSection from "@/components/landing/nexa-demo-section";
import PricingSection from "@/components/landing/pricing-section";
import ProductProofSection from "@/components/landing/product-proof-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import { NiceJobsLanding } from "@/components/nicejobs/nicejobs-landing";
import { isNiceJobsRequest } from "@/lib/nicejobs/domain";

export default async function Home() {
  const session = await auth();
  const isNiceJobs = isNiceJobsRequest();

  if (session?.user) {
    if (isNiceJobs) {
      redirect("/nicejobs");
    }

    redirect(getRoleRedirect(session.user.role as string));
  }

  if (isNiceJobs) {
    return <NiceJobsLanding />;
  }

  return (
    <main
      className="min-h-screen max-w-full overflow-x-hidden bg-[#070709]"
      style={{ overflowX: "hidden" }}
    >
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
