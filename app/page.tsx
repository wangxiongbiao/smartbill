import { Header } from '@/components/Header';
import { Hero } from '@/components/home/Hero';
import { SocialProof } from '@/components/home/SocialProof';
import { Features } from '@/components/home/Features';
import { TemplatesGallery } from '@/components/home/TemplatesGallery';
import { TargetAudience } from '@/components/home/TargetAudience';
import { FeaturesGrid } from '@/components/home/FeaturesGrid';
import { FAQ } from '@/components/home/FAQ';
import { Resources } from '@/components/home/Resources';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Hero />
        <Features />
        <TemplatesGallery />
        <TargetAudience />
        <FeaturesGrid />
        <FAQ />
        {/* <Resources /> */}
      </main>
      <Footer />
    </>
  );
}
