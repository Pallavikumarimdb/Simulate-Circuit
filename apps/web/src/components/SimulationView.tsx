
import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Play, Pause, RotateCcw, Cpu, HardDrive, Download, Bug, AlertCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./ui/tabs";
import { WebContainer } from "@webcontainer/api";

const HardwareSimulator = ({ code, projectType }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [codeOutput, setCodeOutput] = useState([]);
  const [cpuState, setCpuState] = useState({ usage: 0, temp: 25, clockSpeed: 0 });
  const [memoryState, setMemoryState] = useState({ used: 0, total: 1024, allocated: [] });
  const [storageState, setStorageState] = useState({ used: 0, total: 10240, files: [] });
  const [errors, setErrors] = useState([]);
  const [logs, setLogs] = useState([]);
  const simulationInterval = useRef(null);
  const { toast } = useToast();
  const webContainerInstance = useRef(null);

  useEffect(() => {
    async function initializeWebContainer() {
      try {
        if (!webContainerInstance.current) {
          console.log("Initializing WebContainer...");
          const webContainer = await WebContainer.boot();
          webContainerInstance.current = webContainer;
          console.log("WebContainer initialized successfully");
        }
      } catch (error) {
        console.error("Failed to initialize WebContainer:", error);
        addError(`Failed to initialize WebContainer: ${error.message}`);
      }
    }
  
    initializeWebContainer();
  }, []);

  
  // Add logs to the console
  const addLog = (message) => {
    setLogs((prev) => [`${message}`, ...prev].slice(0, 20));
  };

  // Add errors to the console
  const addError = (message) => {
    setErrors((prev) => (prev.includes(message) ? prev : [...prev, message]));
    toast({
      title: "Simulation Error",
      description: message,
      variant: "destructive",
    });
  };

  // Reset the simulation
  const handleReset = () => {
    setIsRunning(false);
    setCodeOutput([]);
    setCpuState({ usage: 0, temp: 25, clockSpeed: 0 });
    setMemoryState({ used: 0, total: 1024, allocated: [] });
    setStorageState({ used: 0, total: 10240, files: [] });
    setErrors([]);
    setLogs([]);

    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }

    toast({
      title: "Simulator Reset",
      description: "All hardware simulation values have been reset",
    });
  };

  // Execute code using WebContainer
  const executeCode = async () => {
    if (!webContainerInstance.current) {
      addError("WebContainer is not initialized yet. Please wait.");
      return;
    }

    try {
      // Write the code to a file in the WebContainer filesystem
      await webContainerInstance.current.fs.writeFile("/index.js", code);

      // Install dependencies (e.g., johnny-five)
      const installProcess = await webContainerInstance.current.spawn("npm", ["install", "johnny-five"]);
      await installProcess.exit;

      // Run the code
      const nodeProcess = await webContainerInstance.current.spawn("node", ["/index.js"]);

      // Capture output
      nodeProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            const message = new TextDecoder().decode(chunk);
            addLog(message);
            setCodeOutput((prev) => [...prev, message]);
          },
        })
      );

      // Wait for the process to exit
      await nodeProcess.exit;
    } catch (error) {
      addError(`Execution error: ${error.message}`);
      setCodeOutput((prev) => [...prev, `ERROR: ${error.message}`]);
    }
  };

  // Toggle simulation
  const toggleSimulation = async () => {
    if (isRunning) {
      setIsRunning(false);
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
        simulationInterval.current = null;
      }
      toast({
        title: "Simulation Paused",
        description: "Hardware simulation has been paused",
      });
    } else {
      setIsRunning(true);
      await executeCode();
      simulateHardware();
      toast({
        title: "Simulation Started",
        description: "Running hardware simulation",
      });
    }
  };

  // Simulate hardware updates
  const simulateHardware = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
    }

    simulationInterval.current = setInterval(() => {
      if (!isRunning) return;

      // Simulate CPU fluctuations
      setCpuState((prev) => ({
        usage: Math.max(5, Math.min(95, prev.usage + Math.random() * 10 - 5)),
        temp: Math.max(25, Math.min(75, prev.temp + Math.random() * 3 - 1.5)),
        clockSpeed: Math.max(0.8, Math.min(4.0, prev.clockSpeed + Math.random() * 0.4 - 0.2)),
      }));

      // Simulate memory fluctuations
      setMemoryState((prev) => {
        const allocatedCopy = [...prev.allocated];
        if (allocatedCopy.length > 0) {
          const randomIndex = Math.floor(Math.random() * allocatedCopy.length);
          const sizeDelta = Math.floor(Math.random() * 10) - 3;
          allocatedCopy[randomIndex] = {
            ...allocatedCopy[randomIndex],
            size: Math.max(10, allocatedCopy[randomIndex].size + sizeDelta),
          };
        }

        const newUsed = allocatedCopy.reduce((sum, block) => sum + block.size, 0);
        return { ...prev, allocated: allocatedCopy, used: newUsed };
      });
    }, 1000);
  };

  // Render CPU visualization
  const renderCpuVisualization = () => {
    const cpuUsageColor = cpuState.usage > 80 ? "text-red-500" : cpuState.usage > 60 ? "text-orange-500" : "text-green-500";
    const tempColor = cpuState.temp > 65 ? "text-red-500" : cpuState.temp > 50 ? "text-orange-500" : "text-green-500";

    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center mb-3">
          <Cpu size={18} className="text-primary mr-2" />
          <h3 className="font-medium text-sm">CPU Status</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <div className="text-xs text-foreground/60 mb-1">Usage</div>
            <div className={`text-lg font-bold ${cpuUsageColor}`}>{cpuState.usage.toFixed(1)}%</div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${cpuState.usage > 80 ? "bg-red-500" : cpuState.usage > 60 ? "bg-orange-500" : "bg-green-500"}`}
                style={{ width: `${cpuState.usage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xs text-foreground/60 mb-1">Temperature</div>
            <div className={`text-lg font-bold ${tempColor}`}>{cpuState.temp.toFixed(1)}°C</div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${cpuState.temp > 65 ? "bg-red-500" : cpuState.temp > 50 ? "bg-orange-500" : "bg-green-500"}`}
                style={{ width: `${(cpuState.temp / 80) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xs text-foreground/60 mb-1">Clock Speed</div>
            <div className="text-lg font-bold text-primary">{cpuState.clockSpeed.toFixed(1)} GHz</div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${(cpuState.clockSpeed / 4.0) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render memory visualization
  const renderMemoryVisualization = () => {
    const memoryUsagePercent = (memoryState.used / memoryState.total) * 100;
    const memoryUsageColor = memoryUsagePercent > 80 ? "text-red-500" : memoryUsagePercent > 60 ? "text-orange-500" : "text-green-500";

    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center mb-3">
          <h3 className="font-medium text-sm">Memory Status</h3>
        </div>
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-foreground/60">Memory Usage</span>
            <span className={`text-xs font-medium ${memoryUsageColor}`}>
              {memoryState.used} MB / {memoryState.total} MB
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${memoryUsagePercent > 80 ? "bg-red-500" : memoryUsagePercent > 60 ? "bg-orange-500" : "bg-green-500"}`}
              style={{ width: `${memoryUsagePercent}%` }}
            ></div>
          </div>
        </div>
        <div className="max-h-36 overflow-auto">
          <div className="text-xs text-foreground/60 mb-2">Allocated Blocks</div>
          {memoryState.allocated.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {memoryState.allocated.map((block) => (
                <div key={block.id} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                    <span className="text-xs font-medium">{block.id}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-foreground/70 mr-2">{block.address}</span>
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {block.size} MB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">No memory blocks allocated</div>
          )}
        </div>
      </div>
    );
  };

  // Render storage visualization
  const renderStorageVisualization = () => {
    const storageUsagePercent = (storageState.used / storageState.total) * 100;
    const storageUsageColor = storageUsagePercent > 80 ? "text-red-500" : storageUsagePercent > 60 ? "text-orange-500" : "text-green-500";

    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center mb-3">
          <HardDrive size={18} className="text-primary mr-2" />
          <h3 className="font-medium text-sm">Storage Status</h3>
        </div>
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-xs text-foreground/60">Disk Usage</span>
            <span className={`text-xs font-medium ${storageUsageColor}`}>
              {storageState.used} MB / {storageState.total} MB
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${storageUsagePercent > 80 ? "bg-red-500" : storageUsagePercent > 60 ? "bg-orange-500" : "bg-green-500"}`}
              style={{ width: `${storageUsagePercent}%` }}
            ></div>
          </div>
        </div>
        <div className="max-h-36 overflow-auto">
          <div className="text-xs text-foreground/60 mb-2">Virtual Files</div>
          {storageState.files.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {storageState.files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        file.name.endsWith(".dat") ? "bg-blue-500" : file.name.endsWith(".config") ? "bg-green-500" : "bg-purple-500"
                      }`}
                    ></div>
                    <span className="text-xs font-medium">{file.name}</span>
                  </div>
                  <span className="text-xs font-medium bg-slate-200 px-2 py-0.5 rounded">
                    {file.size} MB
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">No files created</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background rounded-xl shadow-soft border border-border/80 overflow-hidden">
      <div className="bg-accent/50 px-4 py-2 flex items-center justify-between border-b border-border/80">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Virtual Hardware Simulator</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-foreground/70 hover:text-foreground"
            onClick={handleReset}
            title="Reset Simulation"
          >
            <RotateCcw size={16} />
          </Button>
          <Button
            variant={isRunning ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={toggleSimulation}
            title={isRunning ? "Pause Simulation" : "Run Simulation"}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} />}
          </Button>
        </div>
      </div>
      <div className="p-4 overflow-auto bg-accent/30 h-full flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {renderCpuVisualization()}
          {renderMemoryVisualization()}
          {renderStorageVisualization()}
        </div>
        <Tabs defaultValue="console" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="console">Console Output</TabsTrigger>
            <TabsTrigger value="debug">Debug & Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="console" className="p-0 mt-2">
            <div className="bg-slate-900 text-slate-100 p-3 font-mono text-sm h-40 overflow-auto rounded-lg border border-slate-700">
              {codeOutput.length > 0 ? (
                codeOutput.map((line, index) => (
                  <div key={index} className="mb-1">
                    <span className="opacity-50 mr-2">&gt;</span>
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-slate-400 italic">Run the simulation to see console output</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="debug" className="p-0 mt-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-border/50">
              <div className="bg-slate-100 px-3 py-2 border-b flex items-center">
                <Bug size={14} className="text-primary mr-1" />
                <span className="text-sm font-medium">Debug Monitor</span>
              </div>
              <div className="p-3">
                {errors.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs text-foreground/70 mb-1 flex items-center">
                      <AlertCircle size={12} className="text-red-500 mr-1" />
                      Errors
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <ul className="text-xs space-y-1">
                        {errors.map((error, index) => (
                          <li key={index} className="text-red-600 flex items-center">
                            <span className="text-red-600 mr-1">•</span> {error}
                          </li>
                        ))}
                      </ul>
                      {errors.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs mt-2 h-6 bg-white"
                          onClick={() => setErrors([])}
                        >
                          Clear Errors
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="text-xs text-foreground/70 mb-1">Execution Log</h4>
                  <div className="bg-accent/20 rounded p-2 h-24 overflow-y-auto">
                    {logs.length > 0 ? (
                      <ul className="text-xs space-y-1">
                        {logs.map((log, index) => (
                          <li key={index} className="text-foreground/80">
                            <span className="text-xs opacity-50 mr-1">[{new Date().toLocaleTimeString()}]</span> {log}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-foreground/50 italic">No execution logs yet. Run the simulation to see output.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => {
              const data = {
                timestamp: new Date().toISOString(),
                cpu: cpuState,
                memory: memoryState,
                storage: storageState,
                output: codeOutput,
                errors,
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `hardware-simulation-${new Date().getTime()}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              toast({
                title: "Download Complete",
                description: "Hardware simulation results have been downloaded",
              });
            }}
          >
            <Download size={12} className="mr-1" /> Export Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HardwareSimulator;