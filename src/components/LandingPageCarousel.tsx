import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { 
  landWallpaper1, 
  landWallpaper2, 
  landWallpaper3, 
  landWallpaper4 
} from "@/assets/landing-page";

interface LandingPageCarouselProps {
  onGetStarted: () => void;
}

const LandingPageCarousel = ({ onGetStarted }: LandingPageCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const wallpapers = [
    {
      image: landWallpaper1,
      title: "Discover Land Values",
      subtitle: "Accurate property valuation across Assam"
    },
    {
      image: landWallpaper2,
      title: "Agricultural Excellence", 
      subtitle: "Supporting farmers with transparent land records"
    },
    {
      image: landWallpaper3,
      title: "Tea Garden Heritage",
      subtitle: "Preserving Assam's tea plantation legacy"
    },
    {
      image: landWallpaper4,
      title: "Rural Development",
      subtitle: "Empowering communities through digital transformation"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % wallpapers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [wallpapers.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % wallpapers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + wallpapers.length) % wallpapers.length);
  };

  return (
    <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden rounded-lg">
      {/* Carousel Images */}
      <div className="relative w-full h-full">
        {wallpapers.map((wallpaper, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${wallpaper.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-start z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl text-white">
            <div className="mb-4 flex items-center gap-2 animate-fade-in">
              <div className="w-12 h-12 bg-gradient-to-r from-[#f9c846] to-[#e6b800] rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
              <span className="text-sm md:text-base opacity-90 font-medium">
                Government of Assam Portal
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 animate-fade-in">
              Welcome to{" "}
              <span className="text-[#f9c846] drop-shadow-lg bg-gradient-to-r from-[#f9c846] to-[#e6b800] bg-clip-text text-transparent">
                Assam Land Value & Stamp Duty Calculator
              </span>
            </h1>
            <div className="mb-6 animate-fade-in">
              <h2 className="text-xl md:text-2xl font-semibold mb-2 text-[#f9c846]">
                {wallpapers[currentSlide].title}
              </h2>
              <p className="text-lg md:text-xl opacity-90">
                {wallpapers[currentSlide].subtitle}
              </p>
            </div>
            <p className="text-base md:text-lg mb-8 opacity-80 max-w-2xl animate-fade-in leading-relaxed">
              A centralized portal for property valuation, stamp duty calculation, zonal values, and comprehensive land management services across all districts of Assam.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-scale-in">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-[#22929b] to-[#1b5e6a] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-[#f9c846]"
              >
                Get Started →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 group"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 group"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {wallpapers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-[#f9c846] scale-125"
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default LandingPageCarousel;