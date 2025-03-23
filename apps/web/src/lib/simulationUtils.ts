
export type AICallParams = {
  prompt: string;
  type: 'project_generation' | 'reprompt';
  context?: {
    originalPrompt?: string;
    currentCode?: string;
    currentCircuit?: CircuitData;
    metadata?: ProjectMetadata;
  };
};

export type CircuitComponent = {
  id: string;
  type: string;
  x: number;
  y: number;
  label: string;
};

export type CircuitConnection = {
  from: string;
  to: string;
  fromPin: string;
  toPin: string;
};

export type CircuitData = {
  components: CircuitComponent[];
  connections: CircuitConnection[];
};

export type ProjectMetadata = {
  functionality: string;
  microcontroller: string;
  sensors: string[];
  actuators: string[];
};

export type AIResponse = {
  code?: string;
  circuit?: CircuitData;
  metadata?: ProjectMetadata;
  steps?: string[];
  error?: string;
};


import { callGemini } from './geminiUtils';


export const callAI = async (params: AICallParams): Promise<AIResponse> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error('Google API key is not configured');
    }


    const response = await callGemini(params);
    return parseAIResponse(response);
  } catch (error) {
    console.error('Error calling AI service:', error);
    throw error;
  }
};


export const parseAIResponse = (aiResponse: any): AIResponse => {
  try {
    if (aiResponse.error) {
      return { error: aiResponse.error, steps: [`Error: ${aiResponse.error}`] };
    }

    const parsedResponse: AIResponse = {};

    if (aiResponse.code) {
      parsedResponse.code = aiResponse.code;
    }

    if (aiResponse.circuit) {
      parsedResponse.circuit = {
        components: aiResponse.circuit.components || [],
        connections: aiResponse.circuit.connections || [],
      };
    }

    if (aiResponse.metadata) {
      parsedResponse.metadata = {
        functionality: aiResponse.metadata.functionality || '',
        microcontroller: aiResponse.metadata.microcontroller || 'Arduino Uno',
        sensors: aiResponse.metadata.sensors || [],
        actuators: aiResponse.metadata.actuators || [],
      };
    }

    if (aiResponse.steps && Array.isArray(aiResponse.steps)) {
      parsedResponse.steps = aiResponse.steps;
    } else if (aiResponse.steps && typeof aiResponse.steps === 'string') {
      parsedResponse.steps = aiResponse.steps
        .split(/[\n,]+/)
        .map((step: string) => step.trim())
        .filter((step: string) => step.length > 0);
    } else {
      parsedResponse.steps = [
        'Analyzed your request',
        'Generated code and circuit based on requirements',
      ];
    }

    return parsedResponse;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      error: error instanceof Error ? error.message : String(error),
      steps: ['Error parsing AI response'],
    };
  }
};