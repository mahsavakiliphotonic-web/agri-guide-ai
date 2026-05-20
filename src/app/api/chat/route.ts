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
          diagnosis.treatment_query || diagnosis.disease,
          preferredLanguage
        );
      } else {
        ragAnswer = await queryKnowledgeBase(query, preferredLanguage);
      }

      // Combine vision diagnosis + RAG answer
      let answer = "";
      if (diagnosis) {
        const labels: Record<string, { plant: string; diagnosis: string; urgency: string }> = {
          "Persian": { plant: "گیاه", diagnosis: "تشخیص بیماری", urgency: "میزان اضطرار" },
          "Finnish": { plant: "Kasvi", diagnosis: "Diagnoosi", urgency: "Kiireellisyys" },
          "Spanish": { plant: "Planta", diagnosis: "Diagnóstico", urgency: "Urgencia" },
          "French": { plant: "Plante", diagnosis: "Diagnostic", urgency: "Urgence" },
          "German": { plant: "Pflanze", diagnosis: "Diagnose", urgency: "Dringlichkeit" },
          "Arabic": { plant: "النبات", diagnosis: "التشخيص", urgency: "حالة الاستعجال" },
          "Hindi": { plant: "पौधा", diagnosis: "रोग का निदान", urgency: "तात्कालिकता" },
          "Russian": { plant: "Растение", diagnosis: "Диагноз", urgency: "Срочность" },
          "Chinese": { plant: "植物", diagnosis: "诊断结果", urgency: "紧急程度" },
          "Japanese": { plant: "植物", diagnosis: "診断", urgency: "緊急度" },
        };
        
        const l = labels[preferredLanguage] || { plant: "Plant", diagnosis: "Diagnosis", urgency: "Urgency" };
        
        let urgencyStr = diagnosis.urgency || "High";
        if (preferredLanguage === "Persian") {
          if (urgencyStr.toLowerCase().includes("high")) urgencyStr = "بالا";
          else if (urgencyStr.toLowerCase().includes("med")) urgencyStr = "متوسط";
          else if (urgencyStr.toLowerCase().includes("low")) urgencyStr = "کم";
        } else if (preferredLanguage === "Finnish") {
          if (urgencyStr.toLowerCase().includes("high")) urgencyStr = "Korkea";
          else if (urgencyStr.toLowerCase().includes("med")) urgencyStr = "Keskitaso";
          else if (urgencyStr.toLowerCase().includes("low")) urgencyStr = "Matala";
        } else if (preferredLanguage === "Spanish") {
          if (urgencyStr.toLowerCase().includes("high")) urgencyStr = "Alta";
          else if (urgencyStr.toLowerCase().includes("med")) urgencyStr = "Media";
          else if (urgencyStr.toLowerCase().includes("low")) urgencyStr = "Baja";
        }

        answer += `**🌿 ${l.plant}:** ${diagnosis.species}\n`;
        answer += `**🔬 ${l.diagnosis}:** ${diagnosis.disease}\n`;
        answer += `**⚠️ ${l.urgency}:** ${urgencyStr}\n\n`;
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
