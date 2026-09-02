import {
  Fares,
  Hero,
  HowItWorks,
  Safety,
  ScrollProgress,
  SiteFooter,
  SiteNav,
} from '@/features/landing';

export default function LandingPage() {
  return (
    <>
      <ScrollProgress />
      <SiteNav />
      <main>
        <Hero />
        <HowItWorks />
        <Safety />
        <Fares />
      </main>
      <SiteFooter />
    </>
  );
}
