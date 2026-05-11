import { NextRequest, NextResponse } from "next/server";
import { analyzePlantImage } from "@/backend/services/vision-engine";
import { queryKnowledgeBase } from "@/backend/services/rag-service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const preferredLanguage = (formData.get("preferredLanguage") as string) || "English";
    const arrayBuffer = await file.arrayBuffer();
    const mimeType = file.type || "image/jpeg";

    // Step 1: Vision analysis
    let analysis;
    try {
      analysis = await analyzePlantImage(arrayBuffer, mimeType, preferredLanguage);
    } catch (e: any) {
      if (e.message?.includes("429")) {
        await new Promise(r => setTimeout(r, 5000));
        analysis = await analyzePlantImage(arrayBuffer, mimeType, preferredLanguage);
      } else throw e;
    }

    if (!analysis) throw new Error("Analysis failed");

    // Mandatory cooldown to prevent 429 on the second call
    console.log("Analysis success, cooling down for 3 seconds before RAG...");
    await new Promise(r => setTimeout(r, 3000));

    // Step 2: RAG search (The core requirement)
    let treatment = "";
    try {
      treatment = await queryKnowledgeBase(analysis.treatment_query || analysis.disease, preferredLanguage);
    } catch (e) {
      console.warn("RAG failed, using AI brain as fallback");
      treatment = analysis.treatment || "Please consult a professional for treatment.";
    }

    return NextResponse.json({
      diagnosis: analysis,
      treatment: treatment
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to analyze image' 
    }, { status: 500 });
  }
}
