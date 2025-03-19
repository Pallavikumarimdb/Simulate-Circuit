
import React from 'react';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/50 py-8 mt-16">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <a href="/" className="text-xl font-bold tracking-tight mb-4 block">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                CircuitSim
              </span>
              <span className="text-foreground/80 ml-1">.ai</span>
            </a>
            <p className="text-foreground/70 text-sm mt-2">
              Prompt-to-simulation for hardware development. Build, test, and debug embedded systems with AI.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-foreground/60 hover:text-foreground transition-colors">
                <Mail size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 text-sm uppercase tracking-wider text-foreground/80">Platform</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Features</a>
              </li>
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">How it works</a>
              </li>
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Examples</a>
              </li>
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Pricing</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 text-sm uppercase tracking-wider text-foreground/80">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Documentation</a>
              </li>
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">API Reference</a>
              </li>
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Component Library</a>
              </li>
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Blog</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 text-sm uppercase tracking-wider text-foreground/80">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">About</a>
              </li>
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Contact</a>
              </li>
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-foreground/60 hover:text-foreground transition-colors text-sm">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-foreground/60">
            &copy; {new Date().getFullYear()} CircuitSim.ai. All rights reserved.
          </p>
          <p className="text-sm text-foreground/60 flex items-center mt-2 md:mt-0">
            Made with <Heart size={14} className="text-red-500 mx-1" /> for hardware enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
