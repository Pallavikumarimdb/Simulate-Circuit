
import React from 'react';
import { LightbulbIcon, Check } from 'lucide-react';

interface AIStepsProps {
  steps: string[];
}

const AISteps = ({ steps }: AIStepsProps) => {
  return (
    <div className=" p-4 space-y-4">
      <div className="flex items-center gap-2">
        <LightbulbIcon size={18} className="text-primary" />
        <h2 className="font-semibold">AI-Generated Steps</h2>
      </div>
      
      <div className="h-[55vh] overflow-y-scroll scrollbar-hidden">
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border/80"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary flex-shrink-0">
              <Check size={14} />
            </span>
            <span className="text-sm">{step}</span>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default AISteps;
