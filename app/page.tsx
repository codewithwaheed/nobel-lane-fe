"use client";
import HeroSection from "./compoennts/HeroSection";
// import SkillsSection from "./compoennts/SkillsSection";
import { FleetSection } from "./compoennts/FleetSection";
// import OurTeamSection from "./compoennts/OurTeamSection";
import ReviewsSection from "./compoennts/ReviewsSection";
import WhyChooseSection from "./compoennts/WhyChooseSection";
import FAQSection from "./compoennts/FAQSection";
import SpecialEventsSection from "./compoennts/SpecialEventsSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <SpecialEventsSection />
      <FleetSection />
      <WhyChooseSection />
      {/* <OurTeamSection /> */}
      {/* <SkillsSection /> */}
      <ReviewsSection />
      <FAQSection />
    </div>
  );
}
