'use client'
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { 
  LightbulbIcon, 
  Zap, 
  Code, 
  Cpu, 
  CircuitBoard, 
  BarChart, 
  Wrench,
  RotateCcw,
  Play,
  Pause,
  ArrowRight
} from 'lucide-react';

import NavBar from '../components/NavBar';
import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import PromptInput from '../components/PromptInput';
import Footer from '../components/Footer';



const Index = () => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  const handlePromptSubmit = (promptText: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      // router.push('/project', { state: { prompt: promptText } });
      history.pushState({ prompt: promptText }, "", window.location.pathname + "editor");

      router.push("editor");


      setIsProcessing(false);
    }, 2000);
  };
  
  const toggleSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning);
  };
  
  const resetSimulation = () => {
    setIsSimulationRunning(false);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isLoaded ? 'fade-in' : 'opacity-0'}`}>
      <NavBar />
      
      <main className="flex-1">
        <Hero />

        <section id="features" className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">A Complete Hardware Development Environment</h2>
              <p className="text-foreground/70 max-w-3xl mx-auto">
                CircuitSim.ai combines AI code generation, hardware simulation, and interactive debugging to streamline your embedded systems development.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={LightbulbIcon}
                title="AI Code Generation"
                description="Describe your project in natural language and get complete, ready-to-use Arduino code generated in seconds."
              />
              <FeatureCard 
                icon={CircuitBoard}
                title="Automatic Circuit Design"
                description="Our AI understands your circuit requirements and generates a complete wiring diagram for your project."
                iconClassName="bg-primary/10 text-primary"
              />
              <FeatureCard 
                icon={Zap}
                title="Real-time Simulation"
                description="Test your hardware designs in a virtual environment without physical components. See how your circuit behaves instantly."
                iconClassName="bg-yellow-100 text-yellow-600"
              />
              <FeatureCard 
                icon={BarChart}
                title="Interactive Debugging"
                description="Monitor variables, signals, and component states in real-time. Identify and fix issues without deploying to hardware."
                iconClassName="bg-green-100 text-green-600"
              />
              <FeatureCard 
                icon={Cpu}
                title="Multiple Platforms"
                description="Support for Arduino, ESP8266, ESP32, and other popular microcontrollers. One environment for all your projects."
                iconClassName="bg-purple-100 text-purple-600"
              />
              <FeatureCard 
                icon={Wrench}
                title="Customizable Components"
                description="Extensive library of sensors, actuators, and other hardware components to build virtually any embedded system."
                iconClassName="bg-orange-100 text-orange-600"
              />
            </div>
          </div>
        </section>
        
        <section id="how-it-works" className="py-16 md:py-24 bg-accent/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-foreground/70 max-w-3xl mx-auto">
                From prompt to simulation in three simple steps. No hardware required.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background rounded-xl p-6 shadow-soft flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <div className="hidden md:block absolute top-1/2 right-0 w-full h-0.5 bg-primary/20 -translate-y-1/2 translate-x-full" />
                </div>
                <h3 className="text-xl font-medium mb-3">Describe Your Project</h3>
                <p className="text-foreground/70">
                  Use natural language to describe your hardware project. Include components, functionality, and requirements.
                </p>
              </div>
              
              <div className="bg-background rounded-xl p-6 shadow-soft flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <div className="hidden md:block absolute top-1/2 right-0 w-full h-0.5 bg-primary/20 -translate-y-1/2 translate-x-full" />
                </div>
                <h3 className="text-xl font-medium mb-3">AI Generates Solution</h3>
                <p className="text-foreground/70">
                  Our AI generates Arduino code and creates a complete circuit diagram based on your description.
                </p>
              </div>
              
              <div className="bg-background rounded-xl p-6 shadow-soft flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                </div>
                <h3 className="text-xl font-medium mb-3">Run & Debug</h3>
                <p className="text-foreground/70">
                  Run your simulation instantly. Adjust parameters, test edge cases, and debug your code in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="examples" className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Try It Yourself</h2>
              <p className="text-foreground/70 max-w-3xl mx-auto">
                Experience the prompt-to-simulation workflow with this interactive demo.
              </p>
            </div>
            
            <div className="space-y-6 max-w-5xl mx-auto">
              <PromptInput 
                onSubmit={handlePromptSubmit}
                isProcessing={isProcessing}
              />
              
              {isProcessing && (
                <div className="h-40 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse" />
                      <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin" />
                    </div>
                    <p className="mt-4 text-foreground/70">
                      Generating code and circuit visualization...
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
        
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Revolutionize Your Hardware Development?
              </h2>
              <p className="text-foreground/70 mb-8">
                Join the growing community of developers using CircuitSim.ai to build better hardware, faster than ever before.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="group">
                  Get Started for Free
                  <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button size="lg" variant="outline" className="border-primary/30 hover:border-primary">
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
