# 🌿 AgriGuide AI - Your Professional Smart Agronomist

AgriGuide AI is a cutting-edge, mobile-first web application designed to empower farmers with instant, scientifically-backed plant health diagnoses. By combining **Multimodal AI Vision** with **Retrieval-Augmented Generation (RAG)**, the system provides a seamless experience from capturing a photo in the field to receiving expert treatment advice derived from verified agricultural manuals.

![App Dashboard Placeholder](/api/placeholder/800/450)

---

## 🚀 Core Features

### 1. Multimodal Vision Diagnosis
Powered by **Gemini 1.5 Flash**, the app analyzes plant photos in real-time to identify species and detect diseases or pest infestations with expert-level precision.

### 2. Intelligent RAG Knowledge Base
The core of AgriGuide's reliability is its **Retrieval-Augmented Generation (RAG)** architecture.
- **Scientifically Grounded:** Unlike generic AI, AgriGuide's treatment advice is retrieved exclusively from a local database of verified agricultural PDFs.
- **Boundary of Knowledge:** To ensure 100% accuracy, the AI is instructed to only provide treatments found within the provided context.
- **Future Scalability:** While currently focused on a specific set of diseases (see Library), the system is designed to be easily "upgraded" by simply adding more PDF manuals to the database.

### 3. Smart Library (The Knowledge Map)
The **Library** section is the map of the AI's current expertise. It lists every disease and pest currently indexed in the RAG system.
- **Testing Reference:** For evaluation purposes, users should refer to the Library to see which conditions the system is currently "trained" to handle.
- **Data-Driven:** Each entry in the library represents a deep indexing of professional agricultural research.

### 4. Consultation Case Management (History)
AgriGuide organizes work into **Consultations**.
- **Folder-based Tracking:** Users can create separate folders (Consultations) for different crops or specific field issues.
- **Continuous Dialogue:** If a problem persists, users can return to any previous consultation to continue the conversation with the AI, maintaining the full context of the diagnosis history.

### 5. Agricultural Weather & Localization
- **Dynamic Language:** If a user selects **Finnish**, **Persian**, **Spanish**, etc., in Settings, the AI dynamically translates its entire reasoning and output to that language.
- **Location-Aware Weather:** Using the farm's location, the app provides real-time weather and agricultural warnings.

---

## 🔬 Technical Architecture

### The AI Pipeline
1. **Vision Phase:** User uploads an image → Vision engine extracts `{species, disease, urgency, treatment_query}`.
2. **Retrieval Phase:** The `treatment_query` triggers a vector search against the local PDF database.
3. **Synthesis Phase:** The retrieved scientific context is passed to the LLM to generate a professional recommendation in the user's preferred language.

---

## 🛠️ Evaluation Guide (For Testing)

> [!IMPORTANT]
> **How to Test for Success:** Because this system uses RAG, its treatment expertise is specific to its indexed library. To see the full power of the system, **please use the "Library" tab as a guide.** 
> 
> Select a disease listed in the Library (e.g., *Potato Late Blight* or *Citrus Canker*) and use a corresponding image for analysis. The system will demonstrate its ability to find the exact scientific treatment from the indexed PDFs and present it in your chosen language.

---

## 🏁 Access & Deployment

This project is deployed as a high-performance **PWA (Progressive Web App)** on Vercel.

### 1. Live URL
Access the live application here: [**[Your Vercel URL will go here]**]

### 2. Authentication
The application uses **Firebase Authentication**.
- **Login:** Users can sign up or log in using their email or Google account to keep their consultation history private and secure.

### 3. Mobile Experience
For the best experience (including camera access), open the URL on a mobile device and use the "Add to Home Screen" feature to install it as a native-feeling app.

---
*Developed as a Final Project for the AI in Practice Program - 2026*
