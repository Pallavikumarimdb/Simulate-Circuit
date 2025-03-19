
import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-6 md:px-10",
        isScrolled 
          ? "bg-background/80 backdrop-blur-lg shadow-sm border-b border-border/50" 
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="text-xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              CircuitSim
            </span>
            <span className="text-foreground/80 ml-1">.ai</span>
          </a>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-foreground/70 hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-foreground/70 hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#examples" className="text-foreground/70 hover:text-foreground transition-colors">
            Examples
          </a>
          <Button variant="outline" className="border-primary/30 hover:border-primary">
            Documentation
          </Button>
          <Button>Get Started</Button>
        </nav>
        <button 
          className="md:hidden text-foreground/80 hover:text-foreground transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50 animate-fade-in">
          <div className="py-4 px-6 space-y-4">
            <a 
              href="#features" 
              className="block py-2 text-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="block py-2 text-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="#examples" 
              className="block py-2 text-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Examples
            </a>
            <Button variant="outline" className="w-full border-primary/30 hover:border-primary">
              Documentation
            </Button>
            <Button className="w-full">Get Started</Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
