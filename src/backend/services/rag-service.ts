import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import fs from "fs";
import { getWorkingModels, selfHealModels } from "./self-healing";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

// In-memory knowledge store (Ultra-Stable Fallback)
let knowledgeBase: { text: string; source: string }[] = [];

export const indexBooks = async () => {
    const booksDir = path.join(process.cwd(), "src/database/books");
    if (!fs.existsSync(booksDir)) return;

    const files = fs.readdirSync(booksDir).filter(f => f.endsWith(".pdf"));
    
    knowledgeBase = [];
    for (const file of files) {
        try {
            const loader = new PDFLoader(path.join(booksDir, file));
            const docs = await loader.load();
            const text = docs.map(d => d.pageContent).join("\n");
            knowledgeBase.push({ text, source: file });
        } catch (err) {
            console.error(`Error loading ${file}:`, err);
        }
    }
};


const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export const queryKnowledgeBase = async (query: string, preferredLanguage: string = "English") => {
    if (knowledgeBase.length === 0) {
        await indexBooks();
    }

    let MODELS_TO_TRY = getWorkingModels();
    
    let lastError = "";
    for (const modelName of MODELS_TO_TRY) {
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            try {
                console.log(`Trying model: ${modelName} (Attempt ${attempts + 1})`);
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                });
                
                const relevantData = knowledgeBase.filter(doc => {
                    const searchStr = query.toLowerCase();
                    return doc.text.toLowerCase().includes(searchStr);
                }).slice(0, 2);

                const context = relevantData.length > 0 
                    ? relevantData.map(d => `Source: ${d.source}\nContent: ${d.text.substring(0, 2000)}`).join("\n\n")
                    : "No specific manual context found for this query.";

                const prompt = `
                    SYSTEM INSTRUCTION: You are a world-class professional Agronomist. 
                    CRITICAL LANGUAGE REQUIREMENT: You MUST respond entirely in ${preferredLanguage}. Do NOT use any other language.

                    
                    Expert Knowledge Base Context:
                    ${context}
                    
                    User Query: ${query}
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (err: any) {
                lastError = err.message || "Unknown AI Error";
                console.error(`RAG Error (${modelName}):`, lastError);
                
                // If it's a quota error, wait and retry or try next model
                if (lastError.includes("429") || lastError.includes("Too Many Requests")) {
                    console.log("Quota exceeded, waiting 2 seconds...");
                    await sleep(2000);
                    attempts++;
                } else {
                    break; // Non-quota error, try next model
                }
            }
        }
    }

    const langMap: Record<string, string> = {
        "Finnish": "Tekoäly on tällä hetkellä varattu. Yritä uudelleen hetken kuluttua.",
        "Persian": "متأسفانه در حال حاضر هوش مصنوعی کمی شلوغ است. لطفاً چند لحظه دیگر دوباره امتحان کنید.",
        "English": "AI is currently busy. Please try again in a moment.",
        "Spanish": "La IA está ocupada en este momento. Por favor, inténtelo de nuevo en un momento.",
        "French": "L'IA est actuellement occupée. Veuillez réessayer dans un moment.",
        "German": "KI ist derzeit beschäftigt. Bitte versuchen Sie es in einem Moment noch einmal.",
        "Arabic": "الذكاء الاصطناعي مشغول حاليًا. يرجى المحاولة مرة أخرى بعد قليل."
    };
    
    return langMap[preferredLanguage] || langMap["English"];
};
