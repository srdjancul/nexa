import IntroLoader from "@/components/visuals/intro-loader";
import SnapScroller from "@/components/visuals/snap-scroller";
import { SiteHeader } from "@/components/sections/site-header";
import { Hero } from "@/components/sections/hero";
import { Bento } from "@/components/sections/bento";

export default function Home() {
  return (
    <>
      <IntroLoader />
      <SnapScroller />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Bento />
      </main>
    </>
  );
}
