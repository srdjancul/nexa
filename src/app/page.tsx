import IntroLoader from "@/components/visuals/intro-loader";
import SnapScroller from "@/components/visuals/snap-scroller";
import { SiteHeader } from "@/components/sections/site-header";
import { Hero } from "@/components/sections/hero";
import { Bento } from "@/components/sections/bento";
import { Process } from "@/components/sections/process";
import { Audience } from "@/components/sections/audience";
import { Testimonials } from "@/components/sections/testimonials";
import { Pricing } from "@/components/sections/pricing";
import { FinalCta } from "@/components/sections/final-cta";

export default function Home() {
  return (
    <>
      <IntroLoader />
      <SnapScroller />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Bento />
        <Process />
        <Audience />
        <Testimonials />
        <Pricing />
        <FinalCta />
      </main>
    </>
  );
}
