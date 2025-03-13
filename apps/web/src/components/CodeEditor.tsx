
'use client';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Play, Save, Download, Upload, RefreshCw, Copy, CheckCheck } from 'lucide-react';
import { toast } from '../components/ui/use-toast';

interface CodeEditorProps {
  initialCode?: string;
}

const CodeEditor = ({ initialCode }: CodeEditorProps) => {
  const [code, setCode] = useState(`// Welcome to the AI Embedded Code Editor
// Start typing or use the AI prompt to generate code

void setup() {
  // Initialize your components here
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
  
  Serial.println("Setup complete!");
}

void loop() {
  // Main code will run repeatedly
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}`);

  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleCompile = () => {
    setIsCompiling(true);
    setCompileResult('');
    
    // Simulate compilation process
    setTimeout(() => {
      setIsCompiling(false);
      
      // Randomly decide if compilation succeeded or failed
      const success = Math.random() > 0.2;
      
      if (success) {
        setCompileResult('Compilation successful. No errors found.');
        toast({
          title: "Compilation successful",
          description: "Your code compiled successfully with no errors.",
        });
      } else {
        // Generate random compilation error
        const lineNumber = Math.floor(Math.random() * code.split('\n').length) + 1;
        const errors = [
          `error: 'Serial' was not declared in this scope`,
          `error: expected ';' before '{' token`,
          `error: 'pinMode' was not declared in this scope`,
          `error: undefined reference to 'digitalWrite'`
        ];
        const randomError = errors[Math.floor(Math.random() * errors.length)];
        setCompileResult(`Error on line ${lineNumber}: ${randomError}`);
        
        toast({
          title: "Compilation failed",
          description: `Error on line ${lineNumber}: ${randomError}`,
          variant: "destructive",
        });
      }
    }, 1500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Code copied",
      description: "Code has been copied to clipboard",
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">sketch.ino</span>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleCopyCode}>
            {copied ? <CheckCheck className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="ghost" size="sm">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="ghost" size="sm">
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
        </div>
      </div>
      
      <div className="flex-grow relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="h-full w-full resize-none p-4 font-mono text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-0"
          spellCheck="false"
        />
      </div>
      
      <div className="border-t p-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
        <div className="flex-grow px-4">
          {isCompiling ? (
            <div className="flex items-center text-amber-500">
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
              Compiling...
            </div>
          ) : (
            compileResult && (
              <div className={`text-sm ${compileResult.includes('error') ? 'text-destructive' : 'text-green-500'}`}>
                {compileResult}
              </div>
            )
          )}
        </div>
        <Button onClick={handleCompile} disabled={isCompiling}>
          <Play className="h-4 w-4 mr-1" />
          {isCompiling ? 'Compiling...' : 'Compile & Run'}
        </Button>
      </div>
    </div>
  );
};

export default CodeEditor;
