import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-maroon-800 text-white py-6 mt-10" style={{ zIndex: 10 }}>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-0">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm">© ASSAM LAND CALCULATOR</p>
            <p className="text-xs opacity-75">© {new Date().getFullYear()} Government of Assam. All Rights Reserved.</p>
          </div>

          <div className="flex space-x-4">
            <a href="#" aria-label="Facebook" className="hover:text-maroon-200 transition-colors">
              <Facebook size={18} />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-maroon-200 transition-colors">
              <Twitter size={18} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-maroon-200 transition-colors">
              <Instagram size={18} />
            </a>
            <a href="#" aria-label="Email" className="hover:text-maroon-200 transition-colors">
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div className="mt-6 border-t border-maroon-700 pt-4 text-center text-xs">
          <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-6">
            <a href="#" className="hover:underline">E-NOTHRIAM.ASSAM.GOV.IN</a>
            <a href="#" className="hover:underline">OFFICES</a>
            <a href="#" className="hover:underline">DIGITAL INDIA</a>
            <a href="#" className="hover:underline">HELP</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;