// LandingPage.tsx
import React, { forwardRef, useEffect, useState } from 'react';
import LandingPageCarousel from './LandingPageCarousel';
import Marquee from './Marquee';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { initiatives } from '@/data/initiatives';
import { MapPin, TrendingUp, Shield, Zap, ArrowRight, Building2, Calculator, Database, CheckCircle } from 'lucide-react';

/* ---------- Re-usable Icon ---------- */
const Icon = forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement> & { path: string }
>(({ path, className = 'w-6 h-6', ...rest }, ref) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...rest}
    ref={ref}
  >
    <path d={path} />
  </svg>
));
Icon.displayName = 'Icon';

/* ---------- Recent Initiatives ---------- */
const RecentInitiatives = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('initiatives-section');
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <section 
      id="initiatives-section"
      aria-labelledby="initiatives-title" 
      className="container mx-auto px-4 py-16"
    >
      <header className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h2 id="initiatives-title" className="text-4xl font-bold font-poppins text-maroon-800 mb-4">
          Recent Initiatives
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover the latest government programs and digital initiatives transforming land management in Assam
        </p>
      </header>

      <div className={`relative transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-4">
            {initiatives.map(({ title, description, image, href }, idx) => (
              <CarouselItem key={idx} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <article className="group bg-white rounded-2xl shadow-md overflow-hidden h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="relative overflow-hidden">
                    <img
                      src={image}
                      alt={`${title} - Assam Government initiative`}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-maroon-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold font-poppins text-gray-900 mb-3 line-clamp-2 group-hover:text-maroon-700 transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{description}</p>
                    <a
                      href={href}
                      className="inline-flex items-center gap-2 text-maroon-700 hover:text-maroon-900 font-semibold group/link transition-colors"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </a>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex -left-12 hover:bg-maroon-700 hover:text-white hover:border-maroon-700 transition-colors" />
          <CarouselNext className="hidden lg:flex -right-12 hover:bg-maroon-700 hover:text-white hover:border-maroon-700 transition-colors" />
        </Carousel>
      </div>
    </section>
  );
};

/* ---------- Main Landing Page ---------- */
interface LandingPageProps {
  onGetStarted: () => void;
  onNavigateToSection: (section: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onNavigateToSection,
}) => {
  const [heroVisible, setHeroVisible] = useState(false);
  const [servicesVisible, setServicesVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
    
    const servicesObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setServicesVisible(true);
      },
      { threshold: 0.1 }
    );

    const featuresObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setFeaturesVisible(true);
      },
      { threshold: 0.1 }
    );

    const servicesElement = document.getElementById('services-section');
    const featuresElement = document.getElementById('features-section');
    
    if (servicesElement) servicesObserver.observe(servicesElement);
    if (featuresElement) featuresObserver.observe(featuresElement);

    return () => {
      if (servicesElement) servicesObserver.unobserve(servicesElement);
      if (featuresElement) featuresObserver.unobserve(featuresElement);
    };
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-maroon-50 via-white to-maroon-50 opacity-50 -z-10" />
        <LandingPageCarousel onGetStarted={onGetStarted} />
      </section>

      {/* Quick Links Marquee */}
      <div className="bg-gradient-to-r from-maroon-700 via-maroon-800 to-maroon-700 py-3 shadow-lg">
        <Marquee direction="left" speed="normal">
          <div className="inline-flex items-center gap-x-12 px-4">
            {[
              { label: 'Assam Government Portal', href: 'https://assam.gov.in' },
              { label: 'Revenue Department', href: 'https://landrevenue.assam.gov.in/' },
              { label: 'Assam Land Records', href: 'https://ilrms.assam.gov.in/dhar/index.php/Welcome/SelectLOC' },
              { label: 'Mission Basundhara', href: 'https://basundhara.assam.gov.in/' },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-medium hover:text-yellow-300 transition-colors duration-300 flex items-center gap-2 group"
              >
                <span className="w-2 h-2 bg-yellow-300 rounded-full group-hover:animate-pulse" />
                {label}
              </a>
            ))}
          </div>
        </Marquee>
      </div>

      {/* Stats Bar */}
      <section className="bg-white shadow-sm border-y border-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10,000+', label: 'Properties Valued', icon: Building2 },
              { value: '33', label: 'Districts Covered', icon: MapPin },
              { value: '99.9%', label: 'Accuracy Rate', icon: CheckCircle },
              { value: '24/7', label: 'Service Available', icon: Zap }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className={`text-center transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-maroon-700" />
                <div className="text-3xl font-bold font-poppins text-maroon-800 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section id="services-section" className="container mx-auto px-4 py-20">
        <div className={`text-center mb-16 transition-all duration-700 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold font-poppins text-maroon-800 mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comprehensive land management tools powered by government data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Property Valuation',
              desc: 'Calculate accurate market value of land or property using official guidelines and real-time data.',
              icon: Building2,
              gradient: 'from-maroon-600 to-maroon-800',
              section: 'property-valuation',
            },
            {
              title: 'Stamp Duty Calculator',
              desc: 'Estimate the applicable stamp duty and registration fees instantly for your transactions.',
              icon: Calculator,
              gradient: 'from-maroon-700 to-maroon-900',
              section: 'stamp-duty-calculator',
            },
            {
              title: 'Zonal Value Database',
              desc: 'Access official zonal values and land rates across all districts of Assam.',
              icon: Database,
              gradient: 'from-maroon-800 to-maroon-950',
              section: 'zonal-value-database',
            },
          ].map(({ title, desc, icon: ServiceIcon, gradient, section }, idx) => (
            <article
              key={section}
              className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <div className="p-8">
                <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <ServiceIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold font-poppins text-gray-900 mb-3 group-hover:text-maroon-700 transition-colors">
                  {title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{desc}</p>
                <Button
                  onClick={() => onNavigateToSection(section)}
                  className="group/btn bg-maroon-700 hover:bg-maroon-800 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
              <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-maroon-100 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            </article>
          ))}
        </div>
      </section>

      {/* Recent Initiatives */}
      <RecentInitiatives />

      {/* Key Features */}
      <section id="features-section" className="relative bg-gradient-to-br from-maroon-700 via-maroon-800 to-maroon-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-16 transition-all duration-700 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold font-poppins text-white mb-4">
              Why Choose Us
            </h2>
            <p className="text-maroon-100 text-lg max-w-2xl mx-auto">
              Trusted by thousands for accurate land valuation and transparent processes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: TrendingUp, 
                title: 'Real-time Valuation', 
                desc: 'Updated market rates and instant calculations' 
              },
              { 
                icon: Database, 
                title: 'Digital Land Records', 
                desc: 'Access comprehensive property data online' 
              },
              { 
                icon: Shield, 
                title: 'Transparent Process', 
                desc: 'Government-verified data and calculations' 
              },
              { 
                icon: Zap, 
                title: 'Fast & Accurate', 
                desc: 'Get results in seconds with high precision' 
              },
            ].map(({ icon: FeatureIcon, title, desc }, idx) => (
              <div
                key={idx}
                className={`group text-center transition-all duration-700 ${
                  featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-yellow-300 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                  <div className="relative w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                    <FeatureIcon className="w-10 h-10 text-yellow-300" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-poppins text-white mb-3 group-hover:text-yellow-300 transition-colors">
                  {title}
                </h3>
                <p className="text-maroon-100 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="relative bg-gradient-to-r from-maroon-700 to-maroon-900 rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
          
          <div className="relative z-10 px-8 md:px-16 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-white mb-4">
              Ready to Calculate Your Property Value?
            </h2>
            <p className="text-maroon-100 text-lg mb-8 max-w-2xl mx-auto">
              Get started now with our easy-to-use tools and accurate government data
            </p>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-300 text-maroon-900 font-bold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Start Valuation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
