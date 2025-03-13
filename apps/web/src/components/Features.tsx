
import { Check, Cpu, Zap, Code, Users, Lock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Cpu,
    title: 'Intelligent Code Generation',
    description: 'Our AI understands embedded systems and generates optimized code tailored to your specific hardware.'
  },
  {
    icon: Zap,
    title: 'Real-time Compilation',
    description: 'Compile and test your code instantly in the browser with no setup required.'
  },
  {
    icon: Code,
    title: 'Syntax Highlighting',
    description: 'Powerful editor with syntax highlighting for multiple embedded platforms including Arduino, ESP32, and more.'
  },
  {
    icon: Users,
    title: 'Collaborative Editing',
    description: 'Work together in real-time with your team members on the same project.'
  },
  {
    icon: Lock,
    title: 'Secure Development',
    description: 'Your code and projects are encrypted and secure, accessible only to you and your team.'
  },
  {
    icon: RefreshCw,
    title: 'Version Control',
    description: 'Built-in version history lets you track changes and revert to previous versions when needed.'
  }
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
      <div className="mb-4 w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
        <feature.icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </div>
  );
};

const Features = () => {
  return (
    <section className="py-24 bg-secondary/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Packed with Powerful Features</h2>
          <p className="text-lg text-muted-foreground">
            Our platform combines AI assistance with robust development tools to streamline your embedded projects.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        <div className="mt-20 bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your embedded development?</h3>
              <p className="text-muted-foreground mb-6 md:mb-0">
                Join thousands of developers who are building the future with AI-assisted embedded systems.
              </p>
            </div>
            <button className="rounded-full px-8 py-3 bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
              Start Building Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
