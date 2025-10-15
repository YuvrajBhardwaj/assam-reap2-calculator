// LandingPage.tsx
import React, { forwardRef } from 'react';
import LandingPageCarousel from './LandingPageCarousel';
import Marquee from './Marquee';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { initiatives } from '@/data/initiatives';
import { testimonials } from '@/data/testimonials';
import missionImg from '@/assets/lovable-uploads/image.png';

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
const RecentInitiatives = () => (
  <section aria-labelledby="initiatives-title" className="container mx-auto px-4 py-12">
    <header className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <Icon
          path="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
          className="w-7 h-7 text-blue-700"
        />
        <h2 id="initiatives-title" className="text-3xl font-bold text-maroon-700">
          Recent Initiatives
        </h2>
      </div>
      <a
        href="#"
        className="text-blue-700 hover:text-blue-800 font-medium text-lg transition-colors"
      >
        View All →
      </a>
    </header>

    <div className="relative">
      <Carousel opts={{ align: "start", loop: true }}>
        <CarouselContent>
          {initiatives.map(({ title, description, image, href }, idx) => (
            <CarouselItem key={idx} className="basis-full sm:basis-1/2 lg:basis-1/3">
              <article className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-transform duration-300 h-full hover:-translate-y-1">
                <img
                  src={image}
                  alt={`${title} - Assam Government initiative`}
                  className="w-full h-44 object-cover"
                  loading="lazy"
                />
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h3>
                  <p className="text-sm text-gray-700 line-clamp-3 mb-4">{description}</p>
                  <a
                    href={href}
                    className="inline-flex items-center text-blue-600 hover:text-maroon-800 font-medium group-hover:underline"
                  >
                    Read More
                    <Icon
                      path="M17 8l4 4m0 0l-4 4m4-4H3"
                      className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1"
                    />
                  </a>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-2" />
        <CarouselNext className="-right-2" />
      </Carousel>
    </div>
  </section>
);

/* ---------- Main Landing Page ---------- */
interface LandingPageProps {
  onGetStarted: () => void;
  onNavigateToSection: (section: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onNavigateToSection,
}) => (
  <>
    {/* Hero */}
    <section className="container mx-auto px-4 py-6 pb-4">
      <LandingPageCarousel onGetStarted={onGetStarted} />
    </section>

    {/* Quick links marquee */}
    <Marquee direction="left">
      <div className="inline-flex items-center gap-x-10 px-4">
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
            className="text-maroon-700 font-medium hover:text-maroon-900 transition-colors"
          >
            {label}
          </a>
        ))}
      </div>
    </Marquee>

    

    {/* Featured services */}
    <section className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        {
          title: 'Property Valuation',
          desc: 'Calculate accurate market value of land or property.',
          iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
          section: 'property-valuation',
        },
        {
          title: 'Stamp Duty Calculator',
          desc: 'Estimate the applicable stamp duty.',
          iconPath: 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4',
          section: 'stamp-duty-calculator',
        },
        {
          title: 'Zonal Value Database',
          desc: 'Access official zonal values across Assam.',
          iconPath: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
          section: 'zonal-value-database',
        },
      ].map(({ title, desc, iconPath, section }) => (
        <article
          key={section}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-h-[220px]"
        >
          <div className="w-12 h-12 bg-maroon-700 text-white rounded-full flex items-center justify-center mb-4">
            <Icon path={iconPath} className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-maroon-700 mb-2">{title}</h3>
          <p className="text-gray-600">{desc}</p>
          <button
            onClick={() => onNavigateToSection(section)}
            className="mt-4 inline-flex items-center text-sm text-maroon-700 font-semibold hover:text-maroon-800 underline-offset-4 hover:underline"
          >
            Learn More →
          </button>
        </article>
      ))}
    </section>

    {/* Portal highlights + schemes */}
    <section className="container mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      {/* Left */}
      <aside className="bg-gradient-to-b from-maroon-700 to-maroon-800 rounded-lg shadow-lg p-6 text-white flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Icon path="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" className="w-7 h-7 text-[#f9c846]" />
            Portal Highlights
          </h2>
          <ul className="list-disc list-inside space-y-2 font-medium">
            <li>Upcoming Initiatives</li>
            <li>Important Links</li>
            <li>News & Updates</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          {[
            { label: 'Initiatives', section: 'upcoming-initiatives' },
            { label: 'Links', section: 'important-links' },
            { label: 'News', section: 'news-updates' },
          ].map(({ label, section }) => (
            <button
              key={section}
              onClick={() => onNavigateToSection(section)}
              className="bg-[#f9c846] hover:bg-[#e6b800] text-maroon-800 font-semibold px-4 py-2 rounded shadow transition"
            >
              {label}
            </button>
          ))}
        </div>
      </aside>

      {/* Right */}
      <aside className="bg-white rounded-lg shadow-lg flex flex-col">
        <h2 className="bg-maroon-700 text-white font-semibold text-lg px-4 py-3 rounded-t">
          Notable Schemes & Programs
        </h2>
        <div className="p-4">
          <img
            src={missionImg}
            alt="Mission Basundhara 3.0"
            className="w-full h-64 object-contain rounded"
          />
        </div>
        <ul className="list-disc list-inside text-maroon-700 font-medium px-6 pb-6">
          <li>Mission Basundhara 3.0</li>
          <li>Digital Land Records Modernization</li>
          <li>Citizen Services Portal</li>
        </ul>
      </aside>
    </section>


    {/* Testimonials */}
    
    {/* <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-8 text-maroon-700">Real Stories from Users</h2>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map(({ title, image, story }) => (
          <li key={title} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img src={image} alt={title} className="w-full h-44 object-cover rounded mb-4" />
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{story}</p>
            <button className="mt-4 text-sm text-blue-700 underline hover:text-maroon-800">
              See the story →
            </button>
          </li>
        ))}
      </ul>
    </section> */}

    {/* Key features */}
    <section className="bg-gradient-to-r from-maroon-700 to-maroon-800 py-10">
      <div className="container mx-auto px-4 text-white text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Key Features</h2>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-5">
          {[
            'Real-time Valuation',
            'Digital Land Records',
            'Transparent Process',
            'Multi-language Support',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
              <span className="w-8 h-8 bg-[#f9c846] text-maroon-800 font-bold rounded-full flex items-center justify-center">
                ✓
              </span>
              <span className="font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default LandingPage;