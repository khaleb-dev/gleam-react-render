import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

export const AppFooter = () => {
  return (
    <footer className="bg-white dark:bg-beembyte-darkBlue border-t border-gray-200 dark:border-gray-800 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img
              src="/lovable-uploads/1c57582a-5db7-4f2b-a553-936b472ba1a2.png"
              alt="beembyte"
              className="h-6 w-auto mr-2 invert dark:invert-0"
            />
            <span className="text-lg font-bold text-beembyte-darkBlue dark:text-white">beembyte</span>
          </div>

          <div className="flex space-x-6">
            <Link to="/about" className="text-sm text-gray-500 hover:text-beembyte-purple dark:text-gray-400">About</Link>
            <Link to="/help" className="text-sm text-gray-500 hover:text-beembyte-purple dark:text-gray-400">Help</Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-beembyte-purple dark:text-gray-400">Terms</Link>
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-beembyte-purple dark:text-gray-400">Privacy</Link>
          </div>

          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-beembyte-purple">
              <Twitter size={18} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-beembyte-purple">
              <Facebook size={18} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-beembyte-purple">
              <Instagram size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-beembyte-purple">
              <Linkedin size={18} />
            </a>
          </div>
        </div>

        <div className="mt-4 text-center md:text-left">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} beembyte. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
