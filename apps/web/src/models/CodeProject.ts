
export interface CodeProject {
  id: string;
  title: string;
  description: string;
  userId: string;
  microcontroller: string;
  language: string;
  framework: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeGenerationHistory {
  id: string;
  projectId: string;
  requirements: string;
  generatedCode: string;
  timestamp: Date;
}

// Supported microcontrollers
export const MICROCONTROLLERS = [
  { id: "arduino-uno", name: "Arduino Uno", ram: "2KB", flash: "32KB" },
  { id: "arduino-mega", name: "Arduino Mega", ram: "8KB", flash: "256KB" },
  { id: "esp32", name: "ESP32", ram: "520KB", flash: "4MB" },
  { id: "esp8266", name: "ESP8266", ram: "80KB", flash: "4MB" },
  { id: "stm32f4", name: "STM32F4", ram: "192KB", flash: "1MB" },
  { id: "raspberry-pi-pico", name: "Raspberry Pi Pico", ram: "264KB", flash: "2MB" },
];

// Supported languages
export const LANGUAGES = [
  { id: "c", name: "C" },
  { id: "cpp", name: "C++" },
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "rust", name: "Rust" },
];

// Supported frameworks
export const FRAMEWORKS = [
  { id: "arduino", name: "Arduino" },
  { id: "esp-idf", name: "ESP-IDF" },
  { id: "stm32-hal", name: "STM32 HAL" },
  { id: "freertos", name: "FreeRTOS" },
];
