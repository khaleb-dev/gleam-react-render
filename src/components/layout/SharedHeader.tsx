import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

type HeaderProps = {
  transparent?: boolean;
};

export const SharedHeader = ({ transparent = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={`w-full fixed top-0 z-50 ${transparent ? 'bg-transparent' : 'bg-white/95 dark:bg-beembyte-darkBlue/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/landing" className="flex items-center">
              <img
                src="/lovable-uploads/1c57582a-5db7-4f2b-a553-936b472ba1a2.png"
                alt="beembyte"
                className="h-7 w-auto mr-2 invert dark:invert-0"
              />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">beembyte</h1>
            </Link>
            <div className="hidden md:flex items-center space-x-8 ml-10">
              <Link to="/about" className="text-gray-600 hover:text-primary dark:text-gray-300 text-xs font-medium">About Us</Link>
              <Link to="/help" className="text-gray-600 hover:text-primary dark:text-gray-300 text-xs font-medium">Help Center</Link>
              <a href="#features" className="text-gray-600 hover:text-primary dark:text-gray-300 text-xs font-medium">Features</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" className="hidden md:inline-flex text-xs border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/80 text-white text-xs">
                Sign Up Free
              </Button>
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px] pt-12">
                  <div className="flex flex-col space-y-6">
                    <Link
                      to="/about"
                      className="text-gray-800 hover:text-primary dark:text-white font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      About Us
                    </Link>
                    <Link
                      to="/help"
                      className="text-gray-800 hover:text-primary dark:text-white font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Help Center
                    </Link>
                    <a
                      href="#features"
                      className="text-gray-800 hover:text-primary dark:text-white font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Features
                    </a>
                    <div className="pt-4 flex flex-col space-y-4">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-100">Sign In</Button>
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button className="w-full bg-primary hover:bg-primary/80">Sign Up Free</Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
