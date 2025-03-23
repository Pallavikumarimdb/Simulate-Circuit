'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ChevronLeft, Code, Play, CircuitBoard, MessageSquare } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import CircuitView from '../components/CircuitView';
import AISteps from '../components/AISteps';
import RepromptInput from '../components/RepromptInput';

import { callAI, parseAIResponse, AIResponse } from '../lib/simulationUtils';
import HardwareSimulator from '../components/SimulationView';

interface CircuitComponent {
  id: string;
  type: string;
}

interface Connection {
  from: string;
  to: string;
}

interface CircuitData {
  components: CircuitComponent[];
  connections: Connection[];
}

const ProjectPage = () => {
  const router = useRouter();
  const [currentView, setCurrentView] = useState('code');
  const [prompt] = useState(typeof window !== 'undefined' ? window.history.state?.prompt || '' : '');
  const [code, setCode] = useState('');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [circuitComponents, setCircuitComponents] = useState({
    components: [],
    connections: [],
  });

  const [activeLanguage, setActiveLanguage] = useState<"c" | "cpp" | "python" | "javascript" | "rust">('cpp');
  const [activeMicrocontroller, setActiveMicrocontroller] = useState('arduino-uno');

  const [steps, setSteps] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessingReprompt, setIsProcessingReprompt] = useState(false);
  const [projectMetadata, setProjectMetadata] = useState({
    functionality: '',
    microcontroller: 'Arduino Uno',
    sensors: [] as string[],
    actuators: [] as string[]
  });

  const updateStateFromAIResponse = useCallback((response: Partial<AIResponse>) => {
    if (response.steps && Array.isArray(response.steps) && response.steps.length > 0) {
      setSteps(prev => {
        const newSteps = response.steps!.filter(step => !prev.includes(step));
        if (newSteps.length === 0) return prev;
        return [...prev, ...newSteps];
      });
    }

    if (response.code) {
      setCode(response.code);
    }

    if (response.circuit) {
      //@ts-ignore
      setCircuitComponents(response.circuit);
    }

    if (response.metadata) {
      setProjectMetadata(prev => ({
        ...prev,
        ...response.metadata
      }));
    }
  }, []);

  useEffect(() => {
    if (!prompt) {
      router.push('/');
      return;
    }

    console.log(code);

    const generateProject = async () => {
      try {
        setSteps(["Analyzing your request for a hardware project..."]);

        try {
          const aiResponse = await callAI({
            prompt: prompt,
            type: 'project_generation'
          });

          console.log('AI Response:', aiResponse);

          updateStateFromAIResponse(aiResponse);

          if (aiResponse.code && aiResponse.circuit) {
            setIsLoaded(true);
          }
        } catch (error) {
          console.error("Error generating project:", error);
          setSteps(prev => [
            ...prev,
            `Error generating project: ${error instanceof Error ? error.message : String(error)}`
          ]);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error in project generation:", error);
        setIsLoaded(true);
      }
    };

    generateProject();
  }, [prompt, router, updateStateFromAIResponse]);

  const toggleSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning);
  };

  const resetSimulation = () => {
    setIsSimulationRunning(false);
  };

  const goBack = () => {
    router.push('/');
  };

  const handleReprompt = async (repromptText: string) => {
    setIsProcessingReprompt(true);

    try {
      setSteps(prev => [...prev, `Processing your request: "${repromptText}"`]);

      const aiResponse = await callAI({
        prompt: repromptText,
        type: 'reprompt',
        context: {
          originalPrompt: prompt,
          currentCode: code,
          currentCircuit: circuitComponents,
          metadata: projectMetadata
        }
      });

      updateStateFromAIResponse(aiResponse);

      setSteps(prev => [...prev, "Completed processing your request"]);
    } catch (error) {
      console.error("Error processing reprompt:", error);
      setSteps(prev => [...prev, `Error processing your request: ${error instanceof Error ? error.message : String(error)}`]);
    } finally {
      setIsProcessingReprompt(false);
    }
  };


  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin" />
          </div>
          <p className="mt-4 text-foreground/70">
            Setting up your project...
          </p>
          {steps.length > 0 && (
            <div className="mt-6 max-w-md text-sm text-foreground/60">
              <p className="font-medium mb-2">Progress:</p>
              <ul className="space-y-1">
                {steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-border/80 bg-background sticky top-0 z-10">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ChevronLeft size={18} />
            </Button>
            <h1 className="font-medium truncate w-screen overflow-hidden overflow-ellipsis">
              {projectMetadata.functionality}
            </h1>
          </div>
          {/* <div className="flex items-center gap-2">
            <Button
              variant={isSimulationRunning ? "default" : "outline"}
              size="sm"
              onClick={toggleSimulation}
            >
              <Play size={16} className="mr-2" />
              {isSimulationRunning ? "Stop Simulation" : "Run Simulation"}
            </Button>
          </div> */}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[27%] border-r border-border/80 bg-background/50 hidden md:block overflow-y-auto flex flex-col">
          <AISteps steps={steps} />
          <div className="mt-auto p-4">
            <RepromptInput
              onSubmit={handleReprompt}
              isProcessing={isProcessingReprompt}
            />
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">
          <Tabs defaultValue="code" value={currentView} onValueChange={setCurrentView} className="flex flex-col h-[92vh]">
            <div className="bg-background/80 px-4 py-2 border-b border-border/80">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code size={16} />
                  <span>Code Editor</span>
                </TabsTrigger>
                <TabsTrigger value="circuit" className="flex items-center gap-2">
                  <CircuitBoard size={16} />
                  <span>Circuit</span>
                </TabsTrigger>
                <TabsTrigger value="simulation" className="flex items-center gap-2">
                  <Play size={16} />
                  <span>Simulation</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <TabsContent value="code" className="h-full mt-0 p-0">
                <CodeEditor
                  code={code}
                  title="Arduino Code"
                  onRunCode={toggleSimulation}
                  isRunning={isSimulationRunning}
                />
              </TabsContent>

              <TabsContent value="circuit" className="h-full mt-0 p-0">
                <CircuitView
                  components={circuitComponents.components}
                  connections={circuitComponents.connections}
                />
              </TabsContent>

              <TabsContent value="simulation" className="h-full mt-0 p-0">
                <HardwareSimulator
                  code={code}
                  microcontroller={activeMicrocontroller}
                  language={activeLanguage}
                // isRunning={isSimulationRunning}
                // onReset={resetSimulation}
                />
              </TabsContent >
            </div>
          </Tabs>
        </main>
      </div>

      <div className="md:hidden p-4 border-t border-border/80">
        <RepromptInput
          onSubmit={handleReprompt}
          isProcessing={isProcessingReprompt}
        />
      </div>
    </div>
  );
};

export default ProjectPage;