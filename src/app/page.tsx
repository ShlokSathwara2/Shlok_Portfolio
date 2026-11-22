import WelcomeIntro from "@/components/WelcomeIntro";
import ParticlePortrait from "@/components/portfolio/particle-portrait";
import PortfolioSections from "@/components/portfolio-sections";
import ExperienceStage from "@/components/portfolio/experience-stage";
import SiteBackground from "@/components/portfolio/site-background";
import SiteChrome from "@/components/portfolio/site-chrome";
import SmoothScroll from "@/components/portfolio/smooth-scroll";

export default function Home() {
  return (
    <>
      <SiteBackground />
      <SmoothScroll />
      <SiteChrome />

      <main id="top">
        <WelcomeIntro />
        <ParticlePortrait />
        <ExperienceStage />
        <PortfolioSections />
      </main>
    </>
  );
}
