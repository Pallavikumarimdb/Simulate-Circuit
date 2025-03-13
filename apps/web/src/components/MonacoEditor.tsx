
import { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Button } from '../components/ui/button';
import { Play, Save, Download, Upload, RefreshCw, Copy, CheckCheck, Code, Sparkles } from 'lucide-react';
import { toast } from '../components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface MonacoEditorProps {
  initialCode?: string;
  language?: string;
  onCodeChange?: (code: string) => void;
  onRun?: (code: string) => void;
}

const MonacoEditor = ({ 
  initialCode, 
  language = 'cpp', 
  onCodeChange,
  onRun
}: MonacoEditorProps) => {
  const [code, setCode] = useState(initialCode || getDefaultCodeForLanguage(language));
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiSuggestionActive, setAiSuggestionActive] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
    // Reset code to default when language changes
    setCode(getDefaultCodeForLanguage(language));
  }, [language]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor settings
    editor.updateOptions({
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      tabSize: 2,
    });

    // Configure AI suggestions
    setupAiSuggestions(monaco, language);
    
    // Add syntax highlighting for C, C++, Rust
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true
    });

    // Add custom theme for embedded code
    monaco.editor.defineTheme('embeddedTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
      ],
      colors: {
        'editor.foreground': '#D4D4D4',
        'editor.background': '#1E1E1E',
        'editor.lineHighlightBackground': '#2A2D2E',
        'editorCursor.foreground': '#AEAFAD',
        'editorWhitespace.foreground': '#404040'
      }
    });
    
    monaco.editor.setTheme('embeddedTheme');
  };

  const setupAiSuggestions = (monaco: any, language: string) => {
    // Register completion providers for each language
    const registerProvider = (languageId: string) => {
      monaco.languages.registerCompletionItemProvider(languageId, {
        triggerCharacters: ['.', '#', '<', '"', '(', '/', '*'],
        provideCompletionItems: (model: any, position: any) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });
          
          // Create language-specific suggestions
          const suggestions = createSuggestionsForLanguage(
            languageId, 
            textUntilPosition, 
            monaco.languages.CompletionItemKind
          );
          
          return { suggestions };
        }
      });
    };
    
    // Register for all supported languages
    ['c', 'cpp', 'rust', 'python', 'javascript'].forEach(registerProvider);
  };
  
  const createSuggestionsForLanguage = (
      language: string, 
      textUntilPosition: string, 
      completionKind: any
    ) => {
      const suggestions: monaco.languages.CompletionItem[] = [];
    
    if (language === 'cpp' || language === 'c') {
      // Arduino/C/C++ specific suggestions
      if (textUntilPosition.includes('void se')) {
        suggestions.push({
          label: 'setup()',
          kind: completionKind.Function,
          insertText: 'setup() {\n  // Initialize components\n  Serial.begin(9600);\n  pinMode(LED_BUILTIN, OUTPUT);\n}',
          detail: 'Arduino setup function',
          documentation: 'Arduino setup function that runs once at startup',
        });
      }
      
      if (textUntilPosition.includes('void lo')) {
        suggestions.push({
          label: 'loop()',
          kind: completionKind.Function,
          insertText: 'loop() {\n  // Main code runs repeatedly\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n}',
          detail: 'Arduino main loop function',
          documentation: 'Arduino main loop function that runs repeatedly',
        });
      }
      
      if (textUntilPosition.includes('Serial.')) {
        suggestions.push(
          {
            label: 'Serial.begin',
            kind: completionKind.Method,
            insertText: 'begin(9600);',
            detail: 'Initialize serial communication',
            documentation: 'Sets the data rate in bits per second (baud) for serial data transmission',
          },
          {
            label: 'Serial.print',
            kind: completionKind.Method,
            insertText: 'print($1);',
            detail: 'Print data to the serial port',
            documentation: 'Prints data to the serial port as human-readable ASCII text',
          },
          {
            label: 'Serial.println',
            kind: completionKind.Method,
            insertText: 'println($1);',
            detail: 'Print data with line break',
            documentation: 'Prints data to the serial port as human-readable ASCII text followed by a carriage return and line feed',
          }
        );
      }
      
      if (textUntilPosition.includes('pin') || textUntilPosition.includes('PIN')) {
        suggestions.push(
          {
            label: 'pinMode',
            kind: completionKind.Function,
            insertText: 'pinMode($1, $2);',
            detail: 'Set pin mode',
            documentation: 'Configures the specified pin to behave either as an input or an output',
          },
          {
            label: 'digitalWrite',
            kind: completionKind.Function,
            insertText: 'digitalWrite($1, $2);',
            detail: 'Write digital value',
            documentation: 'Write a HIGH or a LOW value to a digital pin',
          },
          {
            label: 'digitalRead',
            kind: completionKind.Function,
            insertText: 'digitalRead($1)',
            detail: 'Read digital value',
            documentation: 'Reads the value from a specified digital pin, either HIGH or LOW',
          }
        );
      }
    } else if (language === 'rust') {
      // Rust embedded suggestions
      if (textUntilPosition.includes('#[')) {
        suggestions.push({
          label: '#[entry]',
          kind: completionKind.Snippet,
          insertText: '#[entry]\nfn main() -> ! {\n    $1\n    loop {}\n}',
          detail: 'Entry point attribute',
          documentation: 'Marks a function as the entry point of the program',
        });
      }
      
      if (textUntilPosition.includes('println')) {
        suggestions.push({
          label: 'println!',
          kind: completionKind.Snippet,
          insertText: 'println!("$1", $2);',
          detail: 'Print to console with newline',
          documentation: 'Prints formatted text to the standard output, with a newline',
        });
      }
    } else if (language === 'python') {
      // MicroPython suggestions
      if (textUntilPosition.includes('import')) {
        suggestions.push(
          {
            label: 'import machine',
            kind: completionKind.Module,
            insertText: 'import machine',
            detail: 'Import machine module',
            documentation: 'Provides access to hardware-specific functions and classes',
          },
          {
            label: 'import time',
            kind: completionKind.Module,
            insertText: 'import time',
            detail: 'Import time module',
            documentation: 'Provides time-related functions',
          }
        );
      }
      
      if (textUntilPosition.includes('machine.')) {
        suggestions.push(
          {
            label: 'machine.Pin',
            kind: completionKind.Class,
            insertText: 'Pin($1, machine.Pin.$2)',
            detail: 'Create a Pin object',
            documentation: 'Create a new Pin object associated with the given pin',
          },
          {
            label: 'machine.I2C',
            kind: completionKind.Class,
            insertText: 'I2C($1)',
            detail: 'Create an I2C object',
            documentation: 'Create a new I2C object associated with the given parameters',
          }
        );
      }
    }
    
    return suggestions;
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      if (onCodeChange) {
        onCodeChange(value);
      }
    }
  };
  
  const toggleAiSuggestions = () => {
    setAiSuggestionActive(!aiSuggestionActive);
    
    if (!aiSuggestionActive) {
      toast({
        title: "AI Suggestions Enabled",
        description: "AI-powered code suggestions are now active",
      });
      
      // Simulate AI providing a suggestion after a short delay
      setTimeout(() => {
        if (editorRef.current) {
          const position = editorRef.current.getPosition();
          editorRef.current.trigger('keyboard', 'editor.action.triggerSuggest', {});
        }
      }, 500);
    } else {
      toast({
        title: "AI Suggestions Disabled",
        description: "AI-powered code suggestions have been turned off",
      });
    }
  };

  const handleCompile = () => {
    setIsCompiling(true);
    setCompileResult('');
    
    if (onRun) {
      onRun(code);
    }
    
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

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
      toast({
        title: "Code formatted",
        description: "Your code has been formatted",
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">main.{getFileExtension(language)}</span>
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={aiSuggestionActive ? "default" : "ghost"} 
            size="sm" 
            onClick={toggleAiSuggestions}
            className={aiSuggestionActive ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {aiSuggestionActive ? "AI Enabled" : "AI Suggestions"}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleCopyCode}>
            {copied ? <CheckCheck className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleFormat}>
            <Code className="h-4 w-4 mr-1" />
            Format
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
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            readOnly: false,
            minimap: { enabled: true },
            formatOnType: true,
            formatOnPaste: true,
            autoIndent: "full",
            wordWrap: "on",
            parameterHints: {
              enabled: true
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            tabCompletion: "on",
            snippetSuggestions: "inline",
          }}
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
          {isCompiling ? 'Compiling...' : 'Run Simulation'}
        </Button>
      </div>
    </div>
  );
};

// Helper functions
function getFileExtension(language: string): string {
  switch (language) {
    case 'cpp':
      return 'cpp';
    case 'c':
      return 'c';
    case 'rust':
      return 'rs';
    case 'python':
      return 'py';
    case 'javascript':
      return 'js';
    default:
      return 'ino';
  }
}

function getDefaultCodeForLanguage(language: string): string {
  switch (language) {
    case 'cpp':
      return `// Arduino C++ Program
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
}`;
    
    case 'c':
      return `// STM32 C Program
#include "stm32f4xx_hal.h"

void SystemClock_Config(void);
static void MX_GPIO_Init(void);

int main(void)
{
  HAL_Init();
  SystemClock_Config();
  MX_GPIO_Init();

  while (1)
  {
    HAL_GPIO_TogglePin(GPIOA, GPIO_PIN_5);
    HAL_Delay(1000);
  }
}`;
    
    case 'rust':
      return `// Rust Embedded Program
#![no_std]
#![no_main]

use panic_halt as _;
use cortex_m_rt::entry;
use embedded_hal::digital::v2::OutputPin;
use microbit::hal::Timer;
use microbit::Board;

#[entry]
fn main() -> ! {
    let mut board = Board::take().unwrap();
    let mut timer = Timer::new(board.TIMER0);
    
    let mut row1 = board.display_pins.row1;
    let mut col5 = board.display_pins.col5;
    
    loop {
        row1.set_low().unwrap();
        col5.set_high().unwrap();
        timer.delay_ms(1000_u32);
        
        row1.set_high().unwrap();
        col5.set_low().unwrap();
        timer.delay_ms(1000_u32);
    }
}`;
    
    case 'python':
      return `# MicroPython for ESP32
import machine
import time

# Configure the onboard LED pin
led = machine.Pin(2, machine.Pin.OUT)

# Simple blink function
def blink(times=5, delay=0.5):
    for _ in range(times):
        led.value(1)  # LED on
        time.sleep(delay)
        led.value(0)  # LED off
        time.sleep(delay)
    
print("ESP32 MicroPython program started")
blink()  # Blink 5 times on startup

# Main loop
while True:
    led.value(not led.value())  # Toggle LED state
    time.sleep(1)`;
    
    case 'javascript':
      return `// JavaScript for ESP32 (Espruino)
// Set up the built-in LED
let led = D2;
pinMode(led, 'output');

// Blink the LED
function blink(times, delay) {
  times = times || 5;
  delay = delay || 500;
  
  let count = 0;
  let interval = setInterval(() => {
    digitalToggle(led);
    count++;
    if (count >= times * 2) {
      clearInterval(interval);
    }
  }, delay);
}

console.log("ESP32 JavaScript program started");
blink();

// Main loop using setInterval
setInterval(() => {
  digitalToggle(led);
}, 1000);`;
    
    default:
      return `// Arduino C++ Program
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
}`;
  }
}

export default MonacoEditor;
