import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import ForDispensaries from '@/components/ForDispensaries';
import ForGrowers from '@/components/ForGrowers';
import ForCustomers from '@/components/ForCustomers';
import HowItWorks from '@/components/HowItWorks';
import Pricing from '@/components/Pricing';
import TryDemo from '@/components/TryDemo';
import WaitlistForm from '@/components/WaitlistForm';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <ForDispensaries />
        <ForGrowers />
        <ForCustomers />
        <HowItWorks />
        <Pricing />
        <TryDemo />
        <WaitlistForm />
      </main>
      <Footer />
    </>
  );
}
