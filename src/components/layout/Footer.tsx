import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-beembyte-darkBlue border-t border-gray-200 dark:border-gray-800 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center mb-4">
              <img
                src="/lovable-uploads/1c57582a-5db7-4f2b-a553-936b472ba1a2.png"
                alt="beembyte"
                className="h-8 w-auto mr-2 invert dark:invert-0"
              />
              <span className="text-xl font-bold text-beembyte-darkBlue dark:text-white">beembyte</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs mb-4">
              Connecting you with vetted experts for tasks and projects.
            </p>

            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-500 hover:text-beembyte-purple dark:text-gray-400 dark:hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-500 hover:text-beembyte-purple dark:text-gray-400 dark:hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-500 hover:text-beembyte-purple dark:text-gray-400 dark:hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                className="text-gray-500 hover:text-beembyte-purple dark:text-gray-400 dark:hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading text-gray-800 dark:text-white">Product</h3>
            <Link to="#" className="footer-link text-xs">How it Works</Link>
            <Link to="#" className="footer-link text-xs">For Students</Link>
            <Link to="#" className="footer-link text-xs">For Tutors</Link>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading text-gray-800 dark:text-white">Resources</h3>
            <Link to="/help" className="footer-link text-xs">Help Center</Link>
            <Link to="#" className="footer-link text-xs">Blog</Link>
            <Link to="#" className="footer-link text-xs">Tutorials</Link>
            <Link to="#" className="footer-link text-xs">API Documentation</Link>
          </div>

          <div className="footer-column">
            <h3 className="footer-heading text-gray-800 dark:text-white">Company</h3>
            <Link to="/about" className="footer-link text-xs">About Us</Link>
            <Link to="/" className="footer-link text-xs">Careers</Link>
            <Link to="/terms" className="footer-link text-xs">Terms of Service</Link>
            <Link to="/privacy" className="footer-link text-xs">Privacy Policy</Link>
            <Link to="/contact" className="footer-link text-xs">Contact Us</Link>
          </div>
        </div>

        <div className="mt-12 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} beembyte. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms" className="text-xs text-gray-500 hover:text-beembyte-purple dark:text-gray-400">Terms</Link>
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-beembyte-purple dark:text-gray-400">Privacy</Link>
            <Link to="/cookies" className="text-xs text-gray-500 hover:text-beembyte-purple dark:text-gray-400">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
