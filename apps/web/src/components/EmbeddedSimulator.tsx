'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Play, 
  Square, 
  Download, 
  Upload, 
  Terminal, 
  Cpu, 
  Gauge, 
  Pin, 
  WifiIcon,
  Bluetooth,
  Power
} from 'lucide-react';
import { toast } from '../components/ui/use-toast';
import { Card, CardContent } from '../components/ui/card';

interface EmbeddedSimulatorProps {
  code?: string;
  microcontroller: string;
  language: string;
}

interface SerialMessage {
  text: string;
  type: 'info' | 'error' | 'output';
  timestamp: number;
}

interface IOPin {
  id: number;
  name: string;
  type: 'digital' | 'analog' | 'pwm';
  mode: 'input' | 'output';
  value: number;
}

const EmbeddedSimulator = ({ 
  code = '', 
  microcontroller = 'arduino-uno',
  language = 'cpp'
}: EmbeddedSimulatorProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [serialOutput, setSerialOutput] = useState<SerialMessage[]>([
    { text: 'Serial monitor initialized. Ready to receive data.', type: 'info', timestamp: Date.now() }
  ]);
  const serialEndRef = useRef<HTMLDivElement>(null);
  const [currentTab, setCurrentTab] = useState('serial');
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [memoryTotal, setMemoryTotal] = useState(2);
  const [flashUsage, setFlashUsage] = useState(0);
  const [flashTotal, setFlashTotal] = useState(32);
  const [baudRate, setBaudRate] = useState(9600);
  const [pins, setPins] = useState<IOPin[]>([]);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [uploadedBinary, setUploadedBinary] = useState<File | null>(null);

  useEffect(() => {
    let pinConfiguration: IOPin[] = [];
    
    switch (microcontroller) {
      case 'arduino-uno':
        // Digital pins
        const digitalPins: IOPin[] = Array.from({ length: 14 }, (_, i) => ({
          id: i,
          name: `D${i}`,
          type: 'digital',
          mode: 'input',
          value: 0
        }));
        
        // Analog pins
        const analogPins: IOPin[] = Array.from({ length: 6 }, (_, i) => ({
          id: 14 + i,
          name: `A${i}`,
          type: 'analog',
          mode: 'input',
          value: 0
        }));
        
        pinConfiguration = [...digitalPins, ...analogPins] as IOPin[];
        setMemoryTotal(2);
        setFlashTotal(32);
        break;
        
      case 'esp32':
        const esp32Pins: IOPin[] = Array.from({ length: 40 }, (_, i) => {
          let pinType: 'digital' | 'analog' | 'pwm';
          if (i < 8) pinType = 'digital';
          else if (i < 16) pinType = 'analog';
          else pinType = 'pwm';
          
          return {
            id: i,
            name: `GPIO${i}`,
            type: pinType,
            mode: 'input',
            value: 0
          };
        });
        
        pinConfiguration = esp32Pins;
        setMemoryTotal(520);
        setFlashTotal(4096);
        break;
        
      case 'stm32f4':
        // Digital pins PA0-PA15
        const paPins: IOPin[] = Array.from({ length: 16 }, (_, i) => ({
          id: i,
          name: `PA${i}`,
          type: 'digital',
          mode: 'input',
          value: 0
        }));
        
        // Mixed pins PB0-PB15 (Some are analog)
        const pbPins: IOPin[] = Array.from({ length: 16 }, (_, i) => ({
          id: 16 + i,
          name: `PB${i}`,
          type: i < 8 ? 'analog' : 'digital',
          mode: 'input',
          value: 0
        }));
        
        pinConfiguration = [...paPins, ...pbPins];
        setMemoryTotal(128);
        setFlashTotal(1024);
        break;
        
      default:
        pinConfiguration = Array.from({ length: 14 }, (_, i) => ({
          id: i,
          name: `D${i}`,
          type: 'digital',
          mode: 'input',
          value: 0
        }));
        setMemoryTotal(2);
        setFlashTotal(32);
    }
    
    setPins(pinConfiguration);
  }, [microcontroller]);

  useEffect(() => {
    if (serialEndRef.current) {
      serialEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [serialOutput]);

  const handleStartStop = () => {
    if (isRunning) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };

  const startSimulation = () => {
    if (!code && !uploadedBinary) {
      toast({
        title: "Simulation Error",
        description: "No code or binary provided to run",
        variant: "destructive"
      });
      return;
    }
    
    setIsRunning(true);
    addSerialMessage('Starting simulation...', 'info');
    addSerialMessage(`Initializing ${getMCUName(microcontroller)}...`, 'info');
    
    setTimeout(() => {
      addSerialMessage('Firmware uploaded successfully', 'info');
      addSerialMessage('Boot sequence started...', 'output');
      
      if (microcontroller === 'arduino-uno') {
        addSerialMessage('Arduino Uno initialized', 'output');
        if (code.includes('setup()') || uploadedBinary) {
          addSerialMessage('Running setup()...', 'output');
          addSerialMessage('Setup complete!', 'output');
        }
      } else if (microcontroller === 'esp32') {
        addSerialMessage('ESP32 booting...', 'output');
        addSerialMessage('ESP-IDF version: v4.4.1', 'output');
        addSerialMessage('CPU Freq: 240MHz', 'output');
        addSerialMessage('WiFi module initialized', 'output');
      } else if (microcontroller === 'stm32f4') {
        addSerialMessage('STM32F4 initialized', 'output');
        addSerialMessage('SystemCoreClock = 168MHz', 'output');
        addSerialMessage('Peripherals initialized', 'output');
      }
      
      runSimulationLoop();
    }, 1500);
  };

  const runSimulationLoop = () => {
    let loopCount = 0;
    
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    
    simulationIntervalRef.current = setInterval(() => {
      loopCount++;
      
      const newCpuUsage = Math.floor(25 + Math.random() * 15);
      setCpuUsage(newCpuUsage);
      
      const newMemUsage = Math.floor(0.3 * memoryTotal + Math.random() * 0.2 * memoryTotal);
      setMemoryUsage(newMemUsage);
      
      const newFlashUsage = Math.floor(0.4 * flashTotal + Math.random() * 0.1 * flashTotal);
      setFlashUsage(newFlashUsage);
      
      if (loopCount % 5 === 0) {
        updateRandomPin();
      }
      
      if (loopCount % 3 === 0) {
        if ((code.includes('Serial.print') || uploadedBinary) && microcontroller === 'arduino-uno') {
          addSerialMessage(`LED state: ${loopCount % 2 === 0 ? 'HIGH' : 'LOW'}`, 'output');
        } else if (microcontroller === 'esp32' && (code.includes('print') || uploadedBinary)) {
          if (loopCount % 6 === 0) {
            addSerialMessage(`WiFi connected. IP address: 192.168.1.${Math.floor(Math.random() * 255)}`, 'output');
          } else {
            addSerialMessage(`Sensor reading: ${Math.floor(20 + Math.random() * 10)}°C`, 'output');
          }
        } else if (microcontroller === 'stm32f4') {
          addSerialMessage(`ADC value: ${Math.floor(Math.random() * 4095)}`, 'output');
        }
      }
      
      if (loopCount % 20 === 0 && Math.random() > 0.7) {
        addSerialMessage('Warning: High CPU temperature detected', 'error');
      }
    }, 1000);
  };

  const updateRandomPin = () => {
    setPins(currentPins => {
      const newPins = [...currentPins];
      const randomIndex = Math.floor(Math.random() * newPins.length);
      const pin = newPins[randomIndex];
      
      if (pin.mode === 'output' || Math.random() > 0.7) {
        if (pin.type === 'digital') {
          pin.value = pin.value === 0 ? 1 : 0;
        } else if (pin.type === 'analog') {
          pin.value = Math.floor(Math.random() * 1024);
        } else if (pin.type === 'pwm') {
          pin.value = Math.floor(Math.random() * 256);
        }
      }
      
      return newPins;
    });
  };

  const togglePinMode = (pinId: number) => {
    setPins(currentPins => {
      return currentPins.map(pin => {
        if (pin.id === pinId) {
          return {
            ...pin,
            mode: pin.mode === 'input' ? 'output' : 'input',
            value: pin.mode === 'input' ? 0 : pin.value
          };
        }
        return pin;
      });
    });
  };

  const toggleDigitalPinValue = (pinId: number) => {
    setPins(currentPins => {
      return currentPins.map(pin => {
        if (pin.id === pinId && pin.mode === 'output' && pin.type === 'digital') {
          return {
            ...pin,
            value: pin.value === 0 ? 1 : 0
          };
        }
        return pin;
      });
    });
    
    const pin = pins.find(p => p.id === pinId);
    if (pin) {
      addSerialMessage(`Pin ${pin.name} set to ${pin.value === 0 ? 'HIGH' : 'LOW'}`, 'output');
    }
  };

  const stopSimulation = () => {
    setIsRunning(false);
    addSerialMessage('Simulation stopped', 'info');
    
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    
    setCpuUsage(0);
    setMemoryUsage(0);
    setFlashUsage(0);
    
    setPins(currentPins => {
      return currentPins.map(pin => ({
        ...pin,
        value: 0
      }));
    });
  };

  const addSerialMessage = (text: string, type: 'info' | 'error' | 'output' = 'output') => {
    setSerialOutput(prev => [
      ...prev, 
      { text, type, timestamp: Date.now() }
    ]);
  };

  const clearSerialOutput = () => {
    setSerialOutput([
      { text: 'Serial monitor cleared', type: 'info', timestamp: Date.now() }
    ]);
  };

  const handleUploadBinary = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedBinary(file);
      toast({
        title: "Binary uploaded",
        description: `${file.name} (${formatFileSize(file.size)}) ready for simulation`,
      });
      addSerialMessage(`Binary file uploaded: ${file.name} (${formatFileSize(file.size)})`, 'info');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const getMCUName = (id: string): string => {
    switch (id) {
      case 'arduino-uno': return 'Arduino Uno';
      case 'esp32': return 'ESP32 DevKit';
      case 'stm32f4': return 'STM32F4 Discovery';
      default: return 'Unknown MCU';
    }
  };

  return (
    <div className="border rounded-md shadow-sm h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="border-b p-3 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cpu className="h-5 w-5 text-blue-500" />
          <span className="font-medium">{getMCUName(microcontroller)} Simulator</span>
          {isRunning && (
            <div className="flex items-center text-green-500 text-xs ml-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
              Running
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer">
            <input 
              type="file" 
              accept=".bin,.hex,.elf" 
              className="hidden" 
              onChange={handleUploadBinary}
              disabled={isRunning}
            />
            <Button variant="outline" size="sm" disabled={isRunning} asChild>
              <span>
                <Upload className="h-4 w-4 mr-1" />
                Upload Binary
              </span>
            </Button>
          </label>
          <Button 
            onClick={handleStartStop}
            variant={isRunning ? "destructive" : "default"}
            size="sm"
          >
            {isRunning ? (
              <>
                <Square className="h-4 w-4 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue="serial" 
        value={currentTab}
        onValueChange={setCurrentTab}
        className="flex-grow flex flex-col"
      >
        <TabsList className="px-4 pt-2 bg-white dark:bg-gray-900">
          <TabsTrigger value="serial" className="flex items-center">
            <Terminal className="h-4 w-4 mr-1" />
            Serial Monitor
          </TabsTrigger>
          <TabsTrigger value="hardware" className="flex items-center">
            <Cpu className="h-4 w-4 mr-1" />
            Hardware
          </TabsTrigger>
          <TabsTrigger value="io" className="flex items-center">
            <Pin className="h-4 w-4 mr-1" />
            I/O Pins
          </TabsTrigger>
          <TabsTrigger value="peripherals" className="flex items-center">
            <WifiIcon className="h-4 w-4 mr-1" />
            Peripherals
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="serial" className="flex-grow flex flex-col p-0 m-0 h-full">
          <div className="p-3 border-b bg-black text-white font-mono text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Baud rate: {baudRate}</span>
              <select 
                value={baudRate} 
                onChange={(e) => setBaudRate(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs"
              >
                <option value="9600">9600</option>
                <option value="19200">19200</option>
                <option value="38400">38400</option>
                <option value="57600">57600</option>
                <option value="115200">115200</option>
              </select>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearSerialOutput}
              className="h-7 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700"
            >
              Clear
            </Button>
          </div>
          
          <div className="flex-grow overflow-y-auto p-0 bg-black text-white font-mono text-xs">
            <div className="p-3 space-y-1">
              {serialOutput.map((msg, index) => (
                <div 
                  key={index} 
                  className={`
                    ${msg.type === 'info' ? 'text-blue-400' : 
                      msg.type === 'error' ? 'text-red-400' : 'text-green-400'}
                  `}
                >
                  <span className="text-gray-500 mr-2">[{formatTime(msg.timestamp)}]</span>
                  {msg.text}
                </div>
              ))}
              <div ref={serialEndRef} />
            </div>
          </div>
          
          {isRunning && (
            <div className="p-3 border-t bg-black">
              <input
                type="text"
                placeholder="Send serial command..."
                className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-1 text-sm font-mono"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    addSerialMessage(`> ${e.currentTarget.value}`, 'info');
                    setTimeout(() => {
                      addSerialMessage(`Received: ${e.currentTarget.value}`, 'output');
                    }, 300);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="hardware" className="flex-grow p-4 overflow-auto m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-blue-500" />
                  Microcontroller
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Model:</span>
                    <span className="col-span-2 font-medium">{getMCUName(microcontroller)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Architecture:</span>
                    <span className="col-span-2">
                      {microcontroller === 'arduino-uno' ? 'AVR (ATmega328P)' : 
                       microcontroller === 'esp32' ? 'Xtensa LX6' : 'ARM Cortex-M4'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Clock Speed:</span>
                    <span className="col-span-2">
                      {microcontroller === 'arduino-uno' ? '16 MHz' : 
                       microcontroller === 'esp32' ? '240 MHz' : '168 MHz'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Flash Memory:</span>
                    <span className="col-span-2">{flashTotal} KB</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">RAM:</span>
                    <span className="col-span-2">{memoryTotal} KB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Gauge className="h-5 w-5 mr-2 text-amber-500" />
                  Resource Usage
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span className="font-medium">{cpuUsage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          cpuUsage > 80 ? 'bg-red-500' : cpuUsage > 60 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${cpuUsage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>RAM Usage</span>
                      <span className="font-medium">{memoryUsage} / {memoryTotal} KB</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (memoryUsage / memoryTotal) > 0.8 ? 'bg-red-500' : 
                          (memoryUsage / memoryTotal) > 0.6 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(memoryUsage / memoryTotal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Flash Usage</span>
                      <span className="font-medium">{flashUsage} / {flashTotal} KB</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (flashUsage / flashTotal) > 0.8 ? 'bg-red-500' : 
                          (flashUsage / flashTotal) > 0.6 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(flashUsage / flashTotal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Power className="h-5 w-5 mr-2 text-red-500" />
                  Power Consumption
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                      <div className="text-gray-500 mb-1">Current Draw</div>
                      <div className="font-medium text-xl">
                        {isRunning ? (25 + Math.floor(Math.random() * 15)).toFixed(1) : "0.0"} mA
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                      <div className="text-gray-500 mb-1">Voltage</div>
                      <div className="font-medium text-xl">
                        {isRunning ? (3.2 + Math.random() * 0.3).toFixed(2) : "0.00"} V
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                      <div className="text-gray-500 mb-1">Power</div>
                      <div className="font-medium text-xl">
                        {isRunning ? (80 + Math.floor(Math.random() * 40)).toFixed(1) : "0.0"} mW
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                      <div className="text-gray-500 mb-1">Temperature</div>
                      <div className="font-medium text-xl">
                        {isRunning ? (25 + Math.floor(Math.random() * 15)) : "0"}°C
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Terminal className="h-5 w-5 mr-2 text-purple-500" />
                  Firmware Info
                </h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Language:</span>
                    <span className="col-span-2 font-medium">
                      {language === 'cpp' ? 'C++' : 
                       language === 'c' ? 'C' : 
                       language === 'python' ? 'MicroPython' : 
                       language === 'rust' ? 'Rust' : 'JavaScript'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Framework:</span>
                    <span className="col-span-2">
                      {microcontroller === 'arduino-uno' ? 'Arduino' : 
                       microcontroller === 'esp32' ? 'ESP-IDF' : 'STM32 HAL'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Compiler:</span>
                    <span className="col-span-2">
                      {language === 'cpp' || language === 'c' ? 
                        (microcontroller === 'arduino-uno' ? 'avr-gcc 7.3.0' : 
                         microcontroller === 'esp32' ? 'xtensa-esp32-elf-gcc 8.4.0' : 'arm-none-eabi-gcc 10.3.1') : 
                        language === 'python' ? 'MicroPython 1.19.1' : 
                        language === 'rust' ? 'rustc 1.68.0' : 'Espruino 2.08'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Binary size:</span>
                    <span className="col-span-2">
                      {uploadedBinary ? formatFileSize(uploadedBinary.size) : 
                       `${(Math.random() * (flashUsage * 0.3) + flashUsage * 0.2).toFixed(1)} KB`}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Optimization:</span>
                    <span className="col-span-2">Size optimization (-Os)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="io" className="flex-grow p-4 overflow-auto m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pins.map(pin => (
              <div 
                key={pin.id} 
                className={`border rounded-md p-3 flex flex-col space-y-2 ${
                  pin.mode === 'output' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center">
                    <Pin className="h-4 w-4 mr-1.5 text-blue-500" />
                    {pin.name}
                    <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {pin.type}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => togglePinMode(pin.id)}
                  >
                    {pin.mode === 'input' ? 'IN' : 'OUT'}
                  </Button>
                </div>
                
                {pin.mode === 'output' ? (
                  <div className="flex items-center">
                    <span className="text-sm mr-2">Value:</span>
                    {pin.type === 'digital' ? (
                      <Button
                        variant={pin.value === 1 ? "default" : "outline"}
                        size="sm"
                        className="h-7 w-16 text-xs"
                        onClick={() => toggleDigitalPinValue(pin.id)}
                      >
                        {pin.value === 1 ? 'HIGH' : 'LOW'}
                      </Button>
                    ) : (
                      <input
                        type="range"
                        min="0"
                        max={pin.type === 'analog' ? '1023' : '255'}
                        value={pin.value}
                        onChange={(e) => {
                          setPins(currentPins => 
                            currentPins.map(p => 
                              p.id === pin.id ? {...p, value: parseInt(e.target.value)} : p
                            )
                          );
                        }}
                        className="flex-grow h-7"
                      />
                    )}
                    {pin.type !== 'digital' && (
                      <span className="ml-2 text-xs font-mono w-10 text-right">
                        {pin.value}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="text-sm mr-2">Reading:</span>
                    <div className={`flex-grow h-7 flex items-center ${
                      pin.type === 'digital' 
                        ? 'font-medium ' + (pin.value ? 'text-green-600' : 'text-gray-600') 
                        : ''
                    }`}>
                      {pin.type === 'digital' ? (
                        pin.value ? 'HIGH' : 'LOW'
                      ) : (
                        <>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-blue-500"
                              style={{ 
                                width: `${pin.type === 'analog' 
                                  ? (pin.value / 1023) * 100 
                                  : (pin.value / 255) * 100
                                }%` 
                              }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs font-mono w-10 text-right">
                            {pin.value}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="peripherals" className="flex-grow p-4 overflow-auto m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(microcontroller === 'esp32') && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium flex items-center">
                      <WifiIcon className="h-5 w-5 mr-2 text-blue-500" />
                      WiFi Module
                    </h3>
                    <div className="flex items-center">
                      <span className={`mr-2 inline-block w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                      <span className="text-sm text-gray-500">
                        {isRunning ? 'Connected' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-gray-500">SSID:</span>
                      <span className="col-span-2">
                        {isRunning ? 'Simulator_Network' : '—'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-gray-500">IP Address:</span>
                      <span className="col-span-2 font-mono">
                        {isRunning ? '192.168.1.' + Math.floor(Math.random() * 255) : '—'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-gray-500">Signal Strength:</span>
                      <div className="col-span-2 flex items-center">
                        {isRunning ? (
                          <>
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div 
                                className="h-2 rounded-full bg-blue-500"
                                style={{ width: '65%' }}
                              ></div>
                            </div>
                            <span>-65 dBm</span>
                          </>
                        ) : '—'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-gray-500">MAC Address:</span>
                      <span className="col-span-2 font-mono">
                        {isRunning ? '3C:71:BF:XX:XX:XX' : '—'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {(microcontroller === 'esp32') && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium flex items-center">
                      <Bluetooth className="h-5 w-5 mr-2 text-blue-500" />
                      Bluetooth Module
                    </h3>
                    <div className="flex items-center">
                      <span className={`mr-2 inline-block w-2 h-2 rounded-full ${isRunning ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></span>
                      <span className="text-sm text-gray-500">
                        {isRunning ? 'Advertising' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-gray-500">Device Name:</span>
                      <span className="col-span-2">
                        {isRunning ? 'ESP32_BLE_Device' : '—'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-gray-500">Services:</span>
                      <span className="col-span-2">
                        {isRunning ? 'GATT Server (4 services)' : '—'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <span className="text-gray-500">Connected Devices:</span>
                      <span className="col-span-2">
                        {isRunning ? '0' : '—'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">I2C Bus</h3>
                  <div className="flex items-center">
                    <span className={`mr-2 inline-block w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className="text-sm text-gray-500">
                      {isRunning ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Clock Speed:</span>
                    <span className="col-span-2">
                      {isRunning ? '100 kHz' : '—'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Connected Devices:</span>
                    <div className="col-span-2">
                      {isRunning ? (
                        <ul className="list-disc pl-5 space-y-1">
                          <li>OLED Display (0x3C)</li>
                          <li>Temperature Sensor (0x48)</li>
                          {microcontroller === 'esp32' && <li>Accelerometer (0x68)</li>}
                        </ul>
                      ) : '—'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Last Transaction:</span>
                    <span className="col-span-2 font-mono">
                      {isRunning ? 'Write 0x3C: 0x00 0xFF 0x33' : '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">SPI Interface</h3>
                  <div className="flex items-center">
                    <span className={`mr-2 inline-block w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className="text-sm text-gray-500">
                      {isRunning ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Clock Speed:</span>
                    <span className="col-span-2">
                      {isRunning ? '4 MHz' : '—'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Mode:</span>
                    <span className="col-span-2">
                      {isRunning ? 'Mode 0 (CPOL=0, CPHA=0)' : '—'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Connected Devices:</span>
                    <div className="col-span-2">
                      {isRunning ? (
                        <ul className="list-disc pl-5 space-y-1">
                          <li>SD Card (CS: D4)</li>
                          {microcontroller !== 'arduino-uno' && <li>Flash Memory (CS: D10)</li>}
                        </ul>
                      ) : '—'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Last Transaction:</span>
                    <span className="col-span-2 font-mono text-xs">
                      {isRunning ? 'MOSI: 0xA5 0x64 | MISO: 0xFF 0x01' : '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">UART</h3>
                  <div className="flex items-center">
                    <span className={`mr-2 inline-block w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    <span className="text-sm text-gray-500">
                      {isRunning ? 'Transmitting' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Baud Rate:</span>
                    <span className="col-span-2">
                      {isRunning ? baudRate : '—'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">Data Format:</span>
                    <span className="col-span-2">
                      {isRunning ? '8N1 (8 data bits, No parity, 1 stop bit)' : '—'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">RX Buffer:</span>
                    <div className="col-span-2 flex items-center">
                      {isRunning ? (
                        <>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div 
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: '15%' }}
                            ></div>
                          </div>
                          <span>8/64 bytes</span>
                        </>
                      ) : '—'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="text-gray-500">TX Buffer:</span>
                    <div className="col-span-2 flex items-center">
                      {isRunning ? (
                        <>
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div 
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: '30%' }}
                            ></div>
                          </div>
                          <span>19/64 bytes</span>
                        </>
                      ) : '—'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmbeddedSimulator;
