
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import { ArrowRight, Check, Code, Zap, Server } from 'lucide-react';
import { Button } from '../components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main>
        <Hero />
        <Features />
        
        {/* How it works section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform simplifies embedded development with AI assistance at every step.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Code className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Describe Your Project</h3>
                <p className="text-muted-foreground">
                  Simply explain what you want to build using natural language, and our AI will understand your requirements.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Generates Code</h3>
                <p className="text-muted-foreground">
                  Our AI instantly generates optimized code for your specific hardware platform and requirements.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Server className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Test & Deploy</h3>
                <p className="text-muted-foreground">
                  Test your code in our simulator, make adjustments, and deploy directly to your device.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Supported Platforms</h3>
                  <p className="text-muted-foreground mb-6">
                    Our platform works with all major embedded development boards and microcontrollers.
                  </p>
                  
                  <ul className="space-y-3">
                    {['Arduino', 'ESP32', 'ESP8266', 'Raspberry Pi Pico', 'STM32', 'Teensy'].map((platform) => (
                      <li key={platform} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>{platform}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8">
                    <Button>
                      View All Supported Platforms
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1603732551688-ea47202b5ce4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80" 
                    alt="Embedded development boards" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials section */}
        <section className="py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of developers who are already building with our platform.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <span className="text-primary font-semibold">JS</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">John Smith</h4>
                    <p className="text-sm text-muted-foreground">IoT Developer</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "This platform has completely transformed how I build embedded systems. What used to take days now takes hours."
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <span className="text-primary font-semibold">AP</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Alex Peterson</h4>
                    <p className="text-sm text-muted-foreground">Hardware Engineer</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "The AI assistant understands exactly what I need, even when my requirements are complex. It's like having an expert by my side."
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <span className="text-primary font-semibold">ML</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Maria Lopez</h4>
                    <p className="text-sm text-muted-foreground">Robotics Engineer</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "From concept to deployment, this platform has cut my development time in half. The collaboration features are a game changer."
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="bg-gradient-to-r from-primary/90 to-blue-600/90 rounded-3xl p-12 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Revolutionize Your Embedded Development?</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of developers who are building faster with AI-assisted development.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8">
                  Get Started for Free
                </Button>
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 rounded-full px-8">
                  Request a Demo
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
