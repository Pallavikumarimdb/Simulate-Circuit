'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link'
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ease-in-out',
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm' 
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="font-medium text-md">AiEmbedded</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/editor" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Editor
          </Link>
          <Link href="#" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Docs
          </Link>
          <Link href="#" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" size="sm" className="h-9 px-4 rounded-full">
            Log in
          </Button>
          <Button size="sm" className="h-9 px-4 rounded-full">
            Get Started
          </Button>
        </div>

        <button 
          className="md:hidden" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg animate-fade-in">
          <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            <Link 
              href="/" 
              className="text-foreground py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/dashboard" 
              className="text-foreground py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/editor" 
              className="text-foreground py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Editor
            </Link>
            <Link 
              href="#" 
              className="text-foreground py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </Link>
            <Link 
              href="#" 
              className="text-foreground py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="flex flex-col space-y-2 pt-2">
              <Button variant="outline" size="sm" className="w-full justify-center">
                Log in
              </Button>
              <Button size="sm" className="w-full justify-center">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
