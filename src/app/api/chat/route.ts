import { NextRequest, NextResponse } from "next/server";
import { queryKnowledgeBase } from "@/backend/services/rag-service";
import { analyzePlantImage } from "@/backend/services/vision-engine";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // Check if the request contains an image (FormData)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;
      const query = (formData.get("query") as string) || "Identify this plant and check for diseases.";
      const preferredLanguage = (formData.get("preferredLanguage") as string) || "English";

      if (!file) {
        return NextResponse.json({ error: "Image is required" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const mimeType = file.type || "image/jpeg";

      // Step 1: Analyze the image with Gemini Vision
      const diagnosis = await analyzePlantImage(arrayBuffer, mimeType, preferredLanguage);

      // Step 2: Get treatment info from RAG knowledge base
      let ragAnswer = "";
      if (diagnosis && diagnosis.disease && diagnosis.disease !== "unknown") {
        ragAnswer = await queryKnowledgeBase(
          `${query}. The plant appears to be ${diagnosis.species} with ${diagnosis.disease}.`,
          preferredLanguage
        );
      } else {
        ragAnswer = await queryKnowledgeBase(query, preferredLanguage);
      }

      // Combine vision diagnosis + RAG answer
      let answer = "";
      if (diagnosis) {
        answer += `**🌿 Plant:** ${diagnosis.species}\n`;
        answer += `**🔬 Diagnosis:** ${diagnosis.disease}\n`;
        answer += `**⚠️ Urgency:** ${diagnosis.urgency}\n\n`;
      }
      answer += ragAnswer;

      return NextResponse.json({ answer });
    }

    // Text-only query (JSON body)
    const { query, preferredLanguage } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const answer = await queryKnowledgeBase(query, preferredLanguage);
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process your question. Please try again." },
      { status: 500 }
    );
  }
}
