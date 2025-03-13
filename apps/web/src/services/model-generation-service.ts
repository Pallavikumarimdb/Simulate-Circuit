
import { toast } from "../components/ui/use-toast";

export interface HardwareComponent {
  type: 'mcu' | 'led' | 'sensor' | 'button' | 'display' | 'connector';
  position: [number, number, number]; // x, y, z
  rotation: [number, number, number]; // x, y, z in radians
  scale: [number, number, number]; // x, y, z
  color: string;
  name: string;
  properties?: Record<string, any>;
}

export interface GeneratedHardwareModel {
  baseModel: string; // Type of MCU: 'arduino-uno', 'esp32', 'stm32f4'
  components: HardwareComponent[];
  boardDimensions: [number, number, number]; // width, height, depth
  boardColor: string;
  textureMap?: string; // Base64 encoded texture
  normalMap?: string; // Base64 encoded normal map
}

// Extracts component types from code
function detectComponents(code: string): string[] {
  const components: string[] = [];
  
  // MCU type detection
  if (code.includes("ESP32") || code.includes("esp32") || code.includes("ESP-IDF")) {
    components.push("esp32");
  } else if (code.includes("STM32") || code.includes("stm32")) {
    components.push("stm32f4");
  } else {
    components.push("arduino-uno"); // Default
  }
  
  // Component detection
  if (code.toLowerCase().includes("led") || code.includes("digitalWrite") || code.includes("gpio_set_level")) {
    components.push("led");
  }
  
  if (code.toLowerCase().includes("button") || code.toLowerCase().includes("digitalRead") || code.includes("gpio_get_level")) {
    components.push("button");
  }
  
  if (code.toLowerCase().includes("sensor") || code.toLowerCase().includes("analogRead") || code.toLowerCase().includes("adc")) {
    components.push("sensor");
  }
  
  if (code.toLowerCase().includes("display") || code.toLowerCase().includes("oled") || code.toLowerCase().includes("lcd")) {
    components.push("display");
  }
  
  return components;
}

// Analyzes pin connections from code
function analyzePinConnections(code: string, mcuType: string): Record<string, string> {
  const connections: Record<string, string> = {};
  
  // Simple regex for finding pin definitions
  const pinPatterns = [
    /\bconst\s+(\w+)\s*=\s*(\d+)\s*;/g,
    /\b#define\s+(\w+)\s+(\d+)/g,
    /\bpinMode\s*\(\s*(\d+)\s*,/g,
    /\bdigitalWrite\s*\(\s*(\d+)\s*,/g,
    /\bdigitalRead\s*\(\s*(\d+)\s*\)/g,
    /\bgpio_set_direction\s*\(\s*(\d+)\s*,/g
  ];
  
  pinPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const pinName = match[1] || `PIN${match[1]}`;
      const pinNumber = match[2] || match[1];
      
      // Identify likely component type based on context
      let componentType = "unknown";
      const context = code.substring(Math.max(0, match.index - 50), match.index + match[0].length + 50);
      
      if (context.toLowerCase().includes("led")) {
        componentType = "led";
      } else if (context.toLowerCase().includes("button")) {
        componentType = "button";
      } else if (context.toLowerCase().includes("sensor")) {
        componentType = "sensor";
      } else if (context.toLowerCase().includes("display")) {
        componentType = "display";
      }
      
      connections[pinNumber] = componentType;
    }
  });
  
  return connections;
}

// Main function to generate 3D model from code
export async function generateHardwareModel(
  code: string,
  microcontroller: string,
  language: string
): Promise<GeneratedHardwareModel> {
  try {
    console.log(`Generating hardware model for ${microcontroller} using ${language} code`);
    
    // Detect components in the code
    const detectedComponents = detectComponents(code);
    const pinConnections = analyzePinConnections(code, microcontroller);
    
    // Generate components based on detected features
    const components: HardwareComponent[] = [];
    
    // Base MCU component
    components.push({
      type: 'mcu',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#1A73E8',
      name: microcontroller
    });
    
    // Add detected components in a layout around the MCU
    let angleOffset = 0;
    const radius = 5;
    
    Object.entries(pinConnections).forEach(([pinNumber, componentType]) => {
      if (componentType !== "unknown") {
        const angle = (angleOffset * Math.PI * 2) / Object.keys(pinConnections).length;
        angleOffset++;
        
        components.push({
          type: componentType as HardwareComponent['type'],
          position: [
            Math.cos(angle) * radius,
            0.5,
            Math.sin(angle) * radius
          ],
          rotation: [0, -angle, 0],
          scale: [0.5, 0.5, 0.5],
          color: componentType === "led" ? "#FF0000" : 
                 componentType === "button" ? "#4CAF50" : 
                 componentType === "sensor" ? "#FFC107" : "#9C27B0",
          name: `${componentType.toUpperCase()}_PIN${pinNumber}`,
          properties: {
            pinConnection: pinNumber
          }
        });
      }
    });
    
    // If no specific components were detected, add some defaults based on MCU type
    if (components.length === 1) {
      // Just add some default components based on MCU type
      if (microcontroller === "arduino-uno") {
        components.push({
          type: 'led',
          position: [3, 0.5, 0],
          rotation: [0, 0, 0],
          scale: [0.5, 0.5, 0.5],
          color: '#FF0000',
          name: 'LED_13',
          properties: { pinConnection: '13' }
        });
      } else if (microcontroller === "esp32") {
        components.push({
          type: 'led',
          position: [3, 0.5, 0],
          rotation: [0, 0, 0],
          scale: [0.5, 0.5, 0.5],
          color: '#FF0000',
          name: 'LED_2',
          properties: { pinConnection: '2' }
        });
        
        components.push({
          type: 'sensor',
          position: [0, 0.5, 3],
          rotation: [0, Math.PI / 2, 0],
          scale: [0.5, 0.5, 0.5],
          color: '#FFC107',
          name: 'TEMP_SENSOR',
          properties: { pinConnection: '36' }
        });
      } else if (microcontroller === "stm32f4") {
        components.push({
          type: 'led',
          position: [3, 0.5, 0],
          rotation: [0, 0, 0],
          scale: [0.5, 0.5, 0.5],
          color: '#FF0000',
          name: 'LED_PA5',
          properties: { pinConnection: 'PA5' }
        });
      }
    }
    
    // Determine board dimensions based on microcontroller type
    let boardDimensions: [number, number, number] = [10, 1, 6]; // Default
    let boardColor = '#0D47A1';
    
    switch (microcontroller) {
      case 'arduino-uno':
        boardDimensions = [10, 1, 6];
        boardColor = '#0D47A1';
        break;
      case 'esp32':
        boardDimensions = [8, 1, 5];
        boardColor = '#004D40';
        break;
      case 'stm32f4':
        boardDimensions = [12, 1, 8];
        boardColor = '#212121';
        break;
    }
    
    // Generate the model data
    const model: GeneratedHardwareModel = {
      baseModel: microcontroller,
      components,
      boardDimensions,
      boardColor
    };
    
    return model;
  } catch (error) {
    console.error("Error generating hardware model:", error);
    toast({
      title: "Error generating hardware model",
      description: error instanceof Error ? error.message : "An unknown error occurred",
      variant: "destructive",
    });
    
    // Return a basic default model
    return {
      baseModel: microcontroller,
      components: [
        {
          type: 'mcu',
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          color: '#1A73E8',
          name: microcontroller
        }
      ],
      boardDimensions: [10, 1, 6],
      boardColor: '#0D47A1'
    };
  }
}
