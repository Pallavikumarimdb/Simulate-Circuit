
import React, { useEffect, useState, useRef } from 'react';
import { Button } from './ui/button';
import { ChevronRight, Cpu, Zap, Code } from 'lucide-react';

const Hero = () => {
  const [loaded, setLoaded] = useState(false);
  const typedTextRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    setLoaded(true);
    
    const exampleText = "Create a temperature-controlled fan that turns on when temperature exceeds 30°C";
    let i = 0;
    const typingInterval = setInterval(() => {
      if (typedTextRef.current) {
        typedTextRef.current.textContent = exampleText.substring(0, i);
        i++;
        if (i > exampleText.length) {
          clearInterval(typingInterval);
          typedTextRef.current.classList.remove('code-type-animation');
        }
      }
    }, 65);
    
    return () => clearInterval(typingInterval);
  }, []);

  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[30%] -right-[20%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[20%] h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
      </div>
      
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className={`space-y-4 md:space-y-6 ${loaded ? 'animate-slide-up' : 'opacity-0'}`} style={{animationDelay: '0.1s'}}>
            <div className="inline-block rounded-full bg-accent px-3 py-1 text-sm font-medium text-primary">
              Introducing CircuitSim.ai
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tighter md:leading-tight">
              Prompt-to-Simulation for 
              <span className="shimmer-text ml-2">Hardware Development</span>
            </h1>
            <p className="text-foreground/70 md:text-xl max-w-[600px]">
              Design, simulate, and debug embedded systems from natural language prompts. 
              From idea to working hardware in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Button size="lg" className="group">
                Try Now 
                <ChevronRight size={18} className="ml-1 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button size="lg" variant="outline" className="border-primary/30 hover:border-primary">
                Learn More
              </Button>
            </div>
            
            <div className="flex gap-8 pt-6">
              <div className="flex items-center gap-2">
                <Cpu size={20} className="text-primary" />
                <span className="text-sm font-medium">10+ Microcontrollers</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-primary" />
                <span className="text-sm font-medium">Real-Time Simulation</span>
              </div>
              <div className="flex items-center gap-2">
                <Code size={20} className="text-primary" />
                <span className="text-sm font-medium">AI-Generated Code</span>
              </div>
            </div>
          </div>
          
          <div 
            className={`relative rounded-xl overflow-hidden shadow-lg ${loaded ? 'animate-slide-up' : 'opacity-0'}`} 
            style={{animationDelay: '0.3s'}}
          >
            <div className="glass-panel rounded-xl p-6 border border-border/50">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <div className="ml-auto text-sm font-medium text-foreground/60">Prompt</div>
                </div>
                
                <div className="bg-background/20 backdrop-blur-sm rounded-lg p-4 border border-border/40">
                  <p className="text-foreground font-medium">
                    <span ref={typedTextRef} className="code-type-animation"></span>
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/20 backdrop-blur-sm rounded-lg p-4 border border-border/40 h-32 flex items-center justify-center">
                    <div className="text-center text-foreground/60">
                      <span className="block mb-2">Circuit Visualization</span>
                      <div className="animate-pulse">
                        <svg width="80" height="50" viewBox="0 0 80 50" className="mx-auto">
                          <rect x="10" y="10" width="20" height="30" className="fill-primary/20 stroke-primary" rx="2" />
                          <rect x="50" y="15" width="20" height="20" className="fill-primary/20 stroke-primary" rx="10" />
                          <line x1="30" y1="25" x2="50" y2="25" className="stroke-primary stroke-2 circuit-wire" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background/20 backdrop-blur-sm rounded-lg p-4 border border-border/40 h-32 flex items-center justify-center">
                    <div className="text-center text-foreground/60">
                      <span className="block mb-2">Simulation Output</span>
                      <div className="animate-pulse">
                        <svg width="80" height="50" viewBox="0 0 80 50" className="mx-auto">
                          <polyline points="10,40 20,20 30,35 40,10 50,25 60,15 70,30" 
                                  fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
