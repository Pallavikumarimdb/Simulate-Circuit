
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { MessageSquare, Bug, Plus, ArrowRight, Zap, Lightbulb } from 'lucide-react';

interface RepromptInputProps {
  onSubmit: (prompt: string) => void;
  isProcessing?: boolean;
}

const RepromptInput = ({ onSubmit, isProcessing = false }: RepromptInputProps) => {
  const [prompt, setPrompt] = useState('');
  const [repromptType, setRepromptType] = useState<'feature' | 'bug' | 'enhance'>('feature');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isProcessing) {
      onSubmit(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="bg-background rounded-xl shadow-soft border border-border/80 overflow-hidden">
      <div className="bg-accent/50 px-4 py-2 flex items-center justify-between border-b border-border/80">
        <div className="flex items-center gap-1">
          <Button
            variant={repromptType === 'bug' ? "default" : "outline"}
            size="sm"
            onClick={() => setRepromptType('bug')}
            className="gap-1"
          >
            <Bug size={14} />
            <span className="hidden sm:inline">Fix Bug</span>
          </Button>
          <Button
            variant={repromptType === 'feature' ? "default" : "outline"}
            size="sm"
            onClick={() => setRepromptType('feature')}
            className="gap-1"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add Feature</span>
          </Button>
          <Button
            variant={repromptType === 'enhance' ? "default" : "outline"}
            size="sm"
            onClick={() => setRepromptType('enhance')}
            className="gap-1"
          >
            <Lightbulb size={14} />
            <span className="hidden sm:inline">Enhance</span>
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative">
          <Textarea
            placeholder={repromptType === 'bug' 
              ? "Describe the bug you want to fix..." 
              : repromptType === 'feature'
                ? "Describe a new feature you want to add..."
                : "Describe how you want to enhance the circuit or code..."}
            className="h-20 resize-none p-4 pr-12 focus:ring-primary"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isProcessing}
          />
          <Button 
            size="icon" 
            className="absolute right-2 bottom-2 rounded-full w-8 h-8 bg-primary hover:bg-primary/90"
            type="submit"
            disabled={!prompt.trim() || isProcessing}
          >
            <ArrowRight size={16} className="text-primary-foreground" />
          </Button>
        </div>
        
        {isProcessing && (
          <div className="text-sm text-foreground/60 animate-pulse mt-2 text-center">
            Processing your request...
          </div>
        )}
        
        {/* {!isProcessing && (
          <div className="mt-2 text-xs text-foreground/60">
            {repromptType === 'bug' && (
              <div className="flex items-start gap-1">
                <Zap size={12} className="mt-0.5 text-amber-500" />
                <span>Try: "Fix the temperature sensor error checking" or "Debug the LED connection"</span>
              </div>
            )}
            {repromptType === 'feature' && (
              <div className="flex items-start gap-1">
                <Zap size={12} className="mt-0.5 text-amber-500" />
                <span>Try: "Add a status LED indicator" or "Add a buzzer alarm for high temperatures"</span>
              </div>
            )}
            {repromptType === 'enhance' && (
              <div className="flex items-start gap-1">
                <Zap size={12} className="mt-0.5 text-amber-500" />
                <span>Try: "Optimize the code to use less memory" or "Add better comments to explain the circuit"</span>
              </div>
            )}
          </div>
        )} */}

        

      </form>
    </div>
  );
};

export default RepromptInput;
