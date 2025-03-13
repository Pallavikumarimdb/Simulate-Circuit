'use client';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { 
  Send, 
  Sparkles, 
  Loader2, 
  RefreshCw,
  Cpu,
  Code,
  FileCode,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { cn } from '../lib/utils';
import { FRAMEWORKS, LANGUAGES, MICROCONTROLLERS } from '../models/CodeProject';
import { generateCode } from '../api/generateCode';
import { toast } from '../components/ui/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  validationResults?: {
    memoryValid: boolean;
    powerEfficient: boolean;
    compilationValid: boolean;
    warnings: string[];
  };
  resourceEstimates?: {
    ram: string;
    flash: string;
  };
}

interface PromptSectionProps {
  onCodeGenerated?: (code: string) => void;
}

const PromptSection = ({ onCodeGenerated }: PromptSectionProps) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [microcontroller, setMicrocontroller] = useState('arduino-uno');
  const [language, setLanguage] = useState<"c" | "cpp" | "python" | "javascript" | "rust">('cpp');
  const [framework, setFramework] = useState<"arduino" | "esp-idf" | "stm32-hal" | "freertos">('arduino');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your AI embedded coding assistant. Describe your microcontroller project, and I\'ll generate code for you.' 
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    const userMessage = { role: 'user' as const, content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    
    try {
      const response = await generateCode({
        microcontroller,
        requirements: prompt,
        language,
        framework,
      });
      
      if (response.status === "error") {
        throw new Error(response.message);
      }
      
      const { code, explanation, resourceEstimates, validationResults } = response.data;
      
      // Format resource usage information
      const resourceInfo = resourceEstimates ? 
        `\n\n**Resource Usage:**\n- RAM: ${resourceEstimates.ram}\n- Flash: ${resourceEstimates.flash}` : '';
      
      const aiMessage: Message = { 
        role: 'assistant' as const, 
        content: `${explanation}${resourceInfo}\n\n\`\`\`${language}\n${code}\n\`\`\``,
        validationResults,
        resourceEstimates
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // If there's a callback for generated code, call it
      if (onCodeGenerated) {
        onCodeGenerated(code);
      }
      
      // Show validation warnings if any
      if (validationResults?.warnings && validationResults.warnings.length > 0) {
        toast({
          title: "Code Validation Warnings",
          description: validationResults.warnings.join('\n'),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating code:", error);
      
      toast({
        title: "Error generating code",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      
      // Add error message to chat
      const errorMessage = { 
        role: 'assistant' as const, 
        content: `I'm sorry, I encountered an error while generating code: ${error instanceof Error ? error.message : "Unknown error"}`
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateCode = async () => {
    // Find the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMessageIndex === -1) return;
    
    const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex];
    
    // Submit the same prompt again
    setPrompt(lastUserMessage.content);
    handleSubmit(new Event('submit') as unknown as React.FormEvent);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-medium">AI Code Generator</h3>
        </div>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleRegenerateCode}
          disabled={isLoading || messages.length <= 1}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Re-Generate
        </Button>
      </div>
      
      <div className="p-4 border-b bg-muted/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Cpu className="h-4 w-4 mr-1" />
              Microcontroller
            </label>
            <Select
              value={microcontroller}
              onValueChange={setMicrocontroller}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select MCU" />
              </SelectTrigger>
              <SelectContent>
                {MICROCONTROLLERS.map(mcu => (
                  <SelectItem key={mcu.id} value={mcu.id}>
                    {mcu.name} ({mcu.ram}/{mcu.flash})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Code className="h-4 w-4 mr-1" />
              Language
            </label>
            <Select
              value={language}
              onValueChange={val => setLanguage(val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.id} value={lang.id}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <FileCode className="h-4 w-4 mr-1" />
              Framework
            </label>
            <Select
              value={framework}
              onValueChange={val => setFramework(val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent>
                {FRAMEWORKS.map(fw => (
                  <SelectItem key={fw.id} value={fw.id}>
                    {fw.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4" style={{ maxHeight: '60vh' }}>
        {messages.map((message, index) => (
          <div 
            key={index}
            className={cn(
              "flex max-w-[90%] rounded-lg p-4",
              message.role === 'user' 
                ? "ml-auto bg-primary text-primary-foreground" 
                : "bg-muted"
            )}
          >
            <div className="w-full overflow-hidden">
              {message.content.split('\n\n').map((part, i) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                  const code = part.slice(part.indexOf('\n') + 1, part.lastIndexOf('```'));
                  const language = part.slice(3, part.indexOf('\n'));
                  return (
                    <pre key={i} className="mt-2 p-2 bg-gray-800 text-gray-100 rounded overflow-x-auto text-sm">
                      <div className="flex justify-between items-center p-2 bg-gray-900 text-xs text-gray-400 border-b border-gray-700">
                        <span>{language || 'code'}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 text-xs text-gray-400 hover:text-white"
                          onClick={() => {
                            if (onCodeGenerated) {
                              onCodeGenerated(code);
                              toast({
                                title: "Code applied to editor",
                                description: "The generated code has been applied to the editor",
                              });
                            }
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                      <code className="block p-2">{code}</code>
                    </pre>
                  );
                } else if (part.startsWith('**Resource Usage:**')) {
                  // Format resource usage section
                  return (
                    <div key={i} className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
                      <h4 className="font-semibold text-sm">Resource Usage:</h4>
                      {part.split('\n').slice(1).map((line, j) => (
                        <p key={j} className="text-sm mt-1">{line}</p>
                      ))}
                    </div>
                  );
                }
                return <p key={i} className="whitespace-pre-line">{part}</p>;
              })}
              
              {/* Display validation results if available */}
              {message.validationResults && (
                <div className="mt-3 p-3 rounded-md border bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="font-semibold text-sm mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Code Validation
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className={`flex items-center ${message.validationResults.memoryValid ? 'text-green-500' : 'text-red-500'}`}>
                      {message.validationResults.memoryValid ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <X className="h-4 w-4 mr-1" />
                      )}
                      Memory Usage
                    </div>
                    <div className={`flex items-center ${message.validationResults.powerEfficient ? 'text-green-500' : 'text-red-500'}`}>
                      {message.validationResults.powerEfficient ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <X className="h-4 w-4 mr-1" />
                      )}
                      Power Efficiency
                    </div>
                    <div className={`flex items-center ${message.validationResults.compilationValid ? 'text-green-500' : 'text-red-500'}`}>
                      {message.validationResults.compilationValid ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <X className="h-4 w-4 mr-1" />
                      )}
                      Compiles Successfully
                    </div>
                  </div>
                  
                  {message.validationResults.warnings.length > 0 && (
                    <div className="mt-2 text-sm">
                      <h5 className="font-medium text-amber-500 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Warnings:
                      </h5>
                      <ul className="list-disc pl-5 mt-1 text-amber-600 dark:text-amber-400">
                        {message.validationResults.warnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your embedded project requirements..."
            className="flex-grow resize-none"
            rows={2}
          />
          <Button type="submit" size="icon" disabled={isLoading || !prompt.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PromptSection;
