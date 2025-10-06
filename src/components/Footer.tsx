import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

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
          <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-6 mb-4">
            <Link to="/about-us" className="hover:underline">About Us</Link>
            <Link to="/contact" className="hover:underline">Contact</Link>
            <Link to="/notifications" className="hover:underline">Public/Land Notifications</Link>
            <Link to="/related-links" className="hover:underline">Related Links</Link>
          </div>
          <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-6">
            <a href="https://nothriam.assam.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">E-NOTHRIAM.ASSAM.GOV.IN</a>
            <a href="https://digitalindia.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline">DIGITAL INDIA</a>
            <Link to="/contact" className="hover:underline">HELP</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;