import { AICallParams, AIResponse } from './simulationUtils';
import { GoogleGenerativeAI } from '@google/generative-ai';


type GeminiRequestParams = {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
  generationConfig: {
    temperature: number;
    topP: number;
    topK: number;
    maxOutputTokens: number;
  };
};


const promptTemplates = {
  project_generation: `
You are an expert Arduino and electronics engineering assistant specialized in creating hardware projects.

Based on the following user request, create a complete Arduino project:

USER REQUEST: {userPrompt}

Respond with a JSON object in the following structure:
{
  "metadata": {
    "functionality": "Brief description of project functionality",
    "microcontroller": "Arduino model to use",
    "sensors": ["List of sensors needed"],
    "actuators": ["List of actuators/output devices needed"]
  },
  "steps": [
    "Step 1: Detailed analysis of what you're doing",
    "Step 2: Component selection reasoning",
    "Step 3: Circuit design approach",
    "Step 4: Code structure and libraries chosen"
  ],
  "code": "Complete, functional Arduino code including all necessary libraries, proper error handling, and comments",
  "circuit": {
    "components": [
      {
        "id": "unique_id",
        "type": "component_type",
        "x": 100,
        "y": 100,
        "label": "Component Name"
      }
    ],
    "connections": [
      {
        "from": "component_id1",
        "to": "component_id2",
        "fromPin": "pin_name1",
        "toPin": "pin_name2"
      }
    ]
  }
}

The code should be complete, well-commented, include appropriate error handling, and follow best practices for Arduino programming. Circuit components should follow realistic placement and connection patterns.
`,

  reprompt: `
You are an expert Arduino and electronics engineering assistant working on iterative improvements to an existing hardware project.

ORIGINAL PROJECT REQUEST: {originalPrompt}

CURRENT ARDUINO CODE:
\`\`\`
{currentCode}
\`\`\`

CURRENT CIRCUIT CONFIGURATION:
{circuitConfig}

CURRENT PROJECT METADATA:
{metadata}

USER'S NEW REQUEST: {userPrompt}

Analyze the existing project and the new request, then provide updates in a JSON object with the following structure:
{
  "steps": [
    "Step 1: Analysis of the request and current implementation",
    "Step 2: Details of changes being made"
  ],
  "code": "Updated Arduino code with changes highlighted in comments",
  "circuit": {
    "components": [ 
      // Only include new or modified components
    ],
    "connections": [
      // Only include new or modified connections
    ]
  },
  "metadata": {
    // Only include fields that need to be updated
  }
}

Ensure all changes are pragmatic, follow best practices, maintain compatibility with the existing project, and directly address the user's new request.
`,
};

export const callGemini = async (params: AICallParams): Promise<AIResponse> => {
  const apiKey =  process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  let enhancedPrompt = '';
  if (params.type === 'project_generation') {
    enhancedPrompt = promptTemplates.project_generation.replace(
      '{userPrompt}',
      params.prompt
    );
  } else if (params.type === 'reprompt') {
    enhancedPrompt = promptTemplates.reprompt
      .replace('{originalPrompt}', params.context?.originalPrompt || '')
      .replace('{currentCode}', params.context?.currentCode || '')
      .replace(
        '{circuitConfig}',
        JSON.stringify(params.context?.currentCircuit || { components: [], connections: [] }, null, 2)
      )
      .replace(
        '{metadata}',
        JSON.stringify(params.context?.metadata || {}, null, 2)
      )
      .replace('{userPrompt}', params.prompt);
  }

  try {
    const input = {
      contents: [
        {
          parts: [
            {
              text: enhancedPrompt,
            },
          ],
        },
      ],
    };

    const result = await model.generateContent(input.contents[0].parts);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No text response from Gemini API.');
    }

    // Remove Markdown code blocks from the response
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Parse the cleaned response as JSON
    try {
      const fullResponse: AIResponse = JSON.parse(cleanedText);
      return fullResponse;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error('Failed to parse AI response as JSON.');
    }
  } catch (error) {
    console.error('Error with Gemini API request:', error);
    throw error;
  }
};