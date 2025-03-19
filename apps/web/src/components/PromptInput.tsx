
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Send, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isProcessing?: boolean;
}

const PromptInput = ({ onSubmit, isProcessing = false }: PromptInputProps) => {
  const [prompt, setPrompt] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  
  const examplePrompts = [
    "Create a temperature-controlled fan that turns on when temperature exceeds 30°C using an Arduino Uno, DHT11 sensor, and DC motor",
    "Build a smart doorbell with ESP8266 that sends notifications when someone presses the button",
    "Design an automatic plant watering system using Arduino, soil moisture sensor, and water pump",
    "Make an ultrasonic distance meter with LED indicators for different distance ranges"
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isProcessing) {
      onSubmit(prompt);
    }
  };
  
  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setShowExamples(false);
  };

  return (
    <div className="bg-background rounded-xl shadow-soft p-4 border border-border/80">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Textarea
            placeholder="Describe your hardware project..."
            className="h-20 resize-none p-4 pr-12 focus:ring-primary"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isProcessing}
          />
          <Button 
            size="icon" 
            className="absolute right-2 bottom-2 rounded-full w-8 h-8"
            type="submit"
            disabled={!prompt.trim() || isProcessing}
          >
            <Send size={16} />
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="text-foreground/60 hover:text-foreground flex items-center gap-1 px-2"
            onClick={() => setShowExamples(!showExamples)}
          >
            <Lightbulb size={16} />
            Example prompts
            {showExamples ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
          
          {isProcessing && (
            <div className="text-sm text-foreground/60 animate-pulse">
              Processing your prompt...
            </div>
          )}
        </div>
        
        {showExamples && (
          <div className="bg-accent rounded-lg p-2 mt-2 space-y-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                className="text-sm text-left px-3 py-2 rounded-md w-full hover:bg-background transition-colors"
                onClick={() => handleExampleClick(example)}
                type="button"
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default PromptInput;
