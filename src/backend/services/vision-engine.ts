import { GoogleGenerativeAI } from "@google/generative-ai";
import { getWorkingModels } from "./self-healing";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);


const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export const analyzePlantImage = async (imageBuffer: ArrayBuffer, mimeType: string = "image/jpeg", preferredLanguage: string = "English") => {
  let lastError = null;

  const ALL_MODELS = getWorkingModels();

  for (const modelName of ALL_MODELS) {
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        console.log(`Vision: Trying model ${modelName} (Attempt ${attempts + 1})`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `You are a highly deterministic expert plant pathologist and agronomist. 
        Analyze this plant image and provide the most likely, accurate diagnosis.
        Do not hallucinate. Be consistent. If it looks like Potato Late Blight, label it as Late Blight.
        
        CRITICAL LANGUAGE REQUIREMENT: You MUST output all text strictly in ${preferredLanguage}. Do NOT use any other language.
        
        Respond ONLY with a valid JSON object matching this exact structure (no markdown fences, no extra text):
        {
          "species": "Accurate Plant Name in ${preferredLanguage}",
          "disease": "Accurate Disease Name in ${preferredLanguage} (e.g. Potato Wart, Late Blight)",
          "urgency": "Low/Medium/High",
          "treatment_query": "A short English search query (e.g. 'Potato Wart treatment') to find the specific treatment in a knowledge base"
        }`;

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: Buffer.from(imageBuffer).toString("base64"),
              mimeType,
            },
          },
        ]);

        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch (err: any) {
        lastError = err;
        const msg = err.message || "";
        console.warn(`Vision model ${modelName} failed: ${msg}`);
        
        if (msg.includes("429") || msg.includes("Too Many Requests")) {
          await sleep(2000);
          attempts++;
        } else {
          break; // Try next model
        }
      }
    }
  }

  throw lastError || new Error("All vision models failed.");
};
