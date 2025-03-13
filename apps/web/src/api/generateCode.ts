
import { generateEmbeddedCode } from "../services/ai-service";

interface GenerateCodeRequest {
  microcontroller: string;
  requirements: string;
  language: "c" | "cpp" | "python" | "javascript" | "rust";
  framework: "arduino" | "esp-idf" | "stm32-hal" | "freertos";
}

export async function generateCode(req: GenerateCodeRequest) {
  try {
    const result = await generateEmbeddedCode({
      microcontroller: req.microcontroller,
      requirements: req.requirements,
      language: req.language,
      framework: req.framework,
    });
    
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    console.error("API Error in generateCode:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
