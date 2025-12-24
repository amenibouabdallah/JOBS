import HeroSection from '@/components/root/hero-section';
import EventDetails from '@/components/root/event-details';
import RootLayout from '@/components/layout/main-layout';
export default function HomePage() {
  return (
    <RootLayout>
      <section className="bg-white text-foreground">
        <HeroSection />
      </section>
      <section className="bg-gray text-foreground">
        <div className="container mx-auto px-4 py-12">
          <EventDetails />
        </div>
      </section>
    </RootLayout>
  );
}
