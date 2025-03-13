'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import MonacoEditor from '../components/MonacoEditor';
import PromptSection from '../components/PromptSection';
import EmbeddedSimulator from '../components/EmbeddedSimulator';
import HardwareVisualization from '../components/HardwareVisualization';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ChevronRight, ChevronLeft, Cpu, Sparkles, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '../components/ui/use-toast';

const EditorPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [generatedCode, setGeneratedCode] = useState('');
  const [activeLanguage, setActiveLanguage] = useState<"c" | "cpp" | "python" | "javascript" | "rust">('cpp');
  const [activeMicrocontroller, setActiveMicrocontroller] = useState('arduino-uno');
  const [rightPanelMode, setRightPanelMode] = useState<'none' | 'simulator' | 'hardware-3d'>('none');
  
  const handleCodeGenerated = (code: string) => {
    setGeneratedCode(code);
    toast({
      title: "Code generated",
      description: "AI has generated code for your embedded project",
    });
  };

  const handleRunCode = (code: string) => {
    setRightPanelMode('simulator');
    toast({
      title: "Simulation started",
      description: `Running ${activeLanguage.toUpperCase()} code on ${activeMicrocontroller}`,
    });
  };
  
  const handleShowHardwareModel = () => {
    if (rightPanelMode === 'hardware-3d') {
      setRightPanelMode('none');
    } else {
      setRightPanelMode('hardware-3d');
      toast({
        title: "Hardware model generated",
        description: "AI is analyzing your code to create a 3D hardware model",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <motion.main 
        className="flex-grow pt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-[calc(100vh-4rem)] flex">
          {/* Left sidebar */}
          <motion.div 
            className="h-full bg-white dark:bg-gray-900 border-r"
            initial={{ width: sidebarOpen ? 350 : 0 }}
            animate={{ width: sidebarOpen ? 350 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {sidebarOpen && (
              <motion.div 
                className="h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <PromptSection 
                  onCodeGenerated={handleCodeGenerated} 
                />
              </motion.div>
            )}
          </motion.div>
          
          {/* Main editor area */}
          <div className="flex-grow flex flex-col">
            <div className="bg-gray-100 dark:bg-gray-800 border-b p-3 flex items-center justify-between">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="mr-2"
                >
                  {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </Button>
                <span className="text-sm font-medium mr-4">
                  main.
                  {activeLanguage === 'cpp' ? 'cpp' : 
                   activeLanguage === 'c' ? 'c' : 
                   activeLanguage === 'rust' ? 'rs' : 
                   activeLanguage === 'python' ? 'py' : 'js'}
                </span>
                
                <Tabs defaultValue="cpp" value={activeLanguage} onValueChange={(val) => setActiveLanguage(val as any)}>
                  <TabsList>
                    <TabsTrigger value="cpp">C++</TabsTrigger>
                    <TabsTrigger value="c">C</TabsTrigger>
                    <TabsTrigger value="rust">Rust</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex items-center space-x-2">
                <Tabs defaultValue="arduino-uno" value={activeMicrocontroller} onValueChange={setActiveMicrocontroller}>
                  <TabsList>
                    <TabsTrigger value="arduino-uno">Arduino</TabsTrigger>
                    <TabsTrigger value="esp32">ESP32</TabsTrigger>
                    <TabsTrigger value="stm32f4">STM32</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Button 
                  variant={rightPanelMode === 'simulator' ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setRightPanelMode(rightPanelMode === 'simulator' ? 'none' : 'simulator')}
                >
                  <Cpu className="h-4 w-4 mr-1" />
                  {rightPanelMode === 'simulator' ? 'Hide Simulator' : 'Show Simulator'}
                </Button>
                
                <Button 
                  variant={rightPanelMode === 'hardware-3d' ? "secondary" : "outline"}
                  size="sm"
                  onClick={handleShowHardwareModel}
                >
                  <Box className="h-4 w-4 mr-1" />
                  {rightPanelMode === 'hardware-3d' ? 'Hide Hardware' : 'Show Hardware'}
                </Button>
              </div>
            </div>
            
            <div className="flex-grow flex">
              <div className={`flex-grow ${rightPanelMode !== 'none' ? 'w-1/2' : 'w-full'}`}>
                <MonacoEditor 
                  initialCode={generatedCode}
                  language={activeLanguage}
                  onCodeChange={(code) => setGeneratedCode(code)}
                  onRun={handleRunCode}
                />
              </div>
              
              {rightPanelMode === 'simulator' && (
                <div className="w-1/2 border-l">
                  <EmbeddedSimulator 
                    code={generatedCode}
                    microcontroller={activeMicrocontroller}
                    language={activeLanguage}
                  />
                </div>
              )}
              
              {rightPanelMode === 'hardware-3d' && (
                <div className="w-1/2 border-l">
                  <HardwareVisualization
                    code={generatedCode}
                    microcontroller={activeMicrocontroller}
                    language={activeLanguage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default EditorPage;
