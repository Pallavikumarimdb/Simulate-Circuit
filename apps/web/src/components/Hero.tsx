'use client';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { ChevronRight } from 'lucide-react';

const TYPING_SPEED = 30;
const PAUSE_DURATION = 1500;
const CODE_SNIPPETS = [
  `// Initializes the built-in LED as an output
  void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
  }

  servo.attach(9);
  servo.write(angle);
  sensor.begin();
  float temp = sensor.readTemperature();

  if (distance < threshold) {
    activateAlert();
  }`
];


const Hero = () => {
  const [displayedCode, setDisplayedCode] = useState('');
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (isTyping) {
      if (charIndex < CODE_SNIPPETS[currentSnippetIndex].length) {
        const timer = setTimeout(() => {
          setDisplayedCode(prev => prev + CODE_SNIPPETS[currentSnippetIndex][charIndex]);
          setCharIndex(charIndex + 1);
        }, TYPING_SPEED);
        return () => clearTimeout(timer);
      } else {
        setIsTyping(false);
        const timer = setTimeout(() => {
          setIsTyping(true);
          setDisplayedCode('');
          setCharIndex(0);
          setCurrentSnippetIndex((currentSnippetIndex + 1) % CODE_SNIPPETS.length);
        }, PAUSE_DURATION);
        return () => clearTimeout(timer);
      }
    }
  }, [isTyping, charIndex, currentSnippetIndex]);

  return (
    <section className="relative pt-36 pb-16 md:pt-48 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
              Revolutionizing Embedded Development
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
              AI-Powered Embedded Development <span className="text-primary">Made Simple</span>
            </h1>
            <p className="text-md text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              Build embedded systems faster with AI-assisted development. Write less code, solve problems quicker, and deploy with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="rounded-full px-8">
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8">
                View Demo
              </Button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="glass-card rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-gray-900 px-4 py-2 flex items-center">
                <div className="flex space-x-2 items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="mx-auto text-white/70 text-sm">editor.ino</div>
              </div>
              <div className="bg-gray-800 p-6 h-96 flex flex-col justify-between code-editor">
                <pre className="text-white flex-grow">
                  <code>
                    <span className="text-blue-400">// AI-powered embedded code</span>
                    <br /><br />
                    <span className="text-green-400">{displayedCode}</span>
                    <span className="animate-pulse-slow">|</span>
                  </code>
                </pre>
                <div className="mt-auto px-4 py-3 bg-primary/20 rounded-lg text-white text-sm">
                  <span className="text-primary-foreground font-medium">AI Assistant:</span>
                  This code configures the built-in LED pin and sets up the basic structure for your Arduino project.
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
