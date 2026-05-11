import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "src/database/ai-config.json");

export const selfHealModels = async () => {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) return;

    try {
        console.log("Self-Healing: Checking for available models...");
        
        // Use fetch for maximum compatibility with future API versions
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            const geminiModels = data.models
                .filter((m: any) => m.name.includes("gemini") && !m.name.includes("embedding"))
                .map((m: any) => m.name.replace("models/", ""))
                .sort((a: string, b: string) => b.localeCompare(a)); // Prioritize higher versions (e.g. 3.1 > 2.5)

            const config = {
                lastUpdated: new Date().toISOString(),
                availableModels: geminiModels,
                status: "healthy"
            };

            // Ensure directory exists
            const dir = path.dirname(CONFIG_PATH);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
            console.log("Self-Healing: AI configuration updated successfully with models:", geminiModels.slice(0, 3));
            return geminiModels;
        }
    } catch (err) {
        console.error("Self-Healing failed to refresh models:", err);
    }
    return null;
};

export const getWorkingModels = (): string[] => {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
            
            // Auto-trigger refresh in background if older than 6 hours
            const lastUpdate = new Date(config.lastUpdated).getTime();
            if (Date.now() - lastUpdate > 6 * 60 * 60 * 1000) {
                console.log("Self-Healing: Config old, triggering background refresh...");
                selfHealModels(); 
            }

            return config.availableModels || [];
        } else {
            // First time ever? Trigger healing
            selfHealModels();
        }
    } catch (e) {
        console.error("Error reading AI config:", e);
    }
    // Hardcoded safety defaults for 2026
    return ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"];
};
