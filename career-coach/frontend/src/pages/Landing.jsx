import Navbar from '../components/Navbar.jsx'
import Hero from '../components/Hero.jsx'
import Stats from '../components/Stats.jsx'
import Features from '../components/Features.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import WhyChooseUs from '../components/WhyChooseUs.jsx'
import Testimonials from '../components/Testimonials.jsx'
import CTA from '../components/CTA.jsx'
import Footer from '../components/Footer.jsx'

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="bg-grid">
        <Navbar />
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <WhyChooseUs />
        <Testimonials />
        <CTA />
        <Footer />
      </div>
    </div>
  )
}
