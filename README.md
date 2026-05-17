# 🌿 AgriGuide AI - Your Professional Smart Agronomist

AgriGuide AI is a cutting-edge, mobile-first web application designed to empower farmers with instant, scientifically-backed plant health diagnoses. By combining **Multimodal AI Vision** with **Retrieval-Augmented Generation (RAG)**, the system provides a seamless experience from capturing a photo in the field to receiving expert treatment advice derived from verified agricultural manuals.

![App Dashboard Placeholder](/api/placeholder/800/450)

---

## ✨ Key Features

- **🧠 Advanced RAG Architecture**: Direct integration with a curated agricultural knowledge base. The AI strictly prioritizes indexed scientific data over generic LLM training to ensure 100% accurate diagnostic recommendations.
- **📸 Multi-modal Diagnostics**: Real-time image analysis via camera or file upload, enabling instant field identification of plant pathologies.
- **📂 Persistent Consultation Management**: A professional "ChatGPT-style" session architecture. Consultations are automatically categorized into folders with full CRUD (Create, Read, Update, Delete) capabilities. So, the user can return to previous chats to continue consulting.
- **🖼️ Persistent Visual History**: Every consultation folder preserves its full visual context, including high-resolution Base64-encoded image history stored locally for instant offline retrieval.
- **⚡ Streamlined Navigation**: Optimized user interface with "One-Touch" session initiation and a premium, responsive design tailored for both desktop and field use.
- **🌍 Dynamic Localization**: Full support for English, Persian, and Spanish, ensuring accessible expert advice for global farming communities.
- **🌦️ Real-time Environmental Context**: Integrated weather dashboard to correlate local climate conditions with potential fungal or pest outbreaks.

---

## 🔬 Technical Architecture

### The AI Pipeline
1. **Vision Phase:** User uploads an image → Vision engine extracts `{species, disease, urgency, treatment_query}`.
2. **Retrieval Phase:** The `treatment_query` triggers a vector search against the local PDF database.
3. **Synthesis Phase:** The retrieved scientific context is passed to the LLM to generate a professional recommendation in the user's preferred language.

## 🛠️ Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Modern, high-performance web foundation |
| **Styling** | Tailwind CSS 4 + Framer Motion | Premium, animated, and responsive UI |
| **AI Engine** | Google Gemini 1.5 Pro | State-of-the-art vision and reasoning |
| **Orchestration** | LangChain | Robust RAG and document processing |
| **Persistence** | Browser LocalStorage | Secure, privacy-focused client-side storage |
| **Backend** | Node.js | Fast API execution and server-side processing |

---

## 🛠️ Evaluation Guide (For Testing)

> [!IMPORTANT]
> **How to Test for Success:** Because this system uses RAG, its treatment expertise is specific to its indexed library. To see the full power of the system, **please use the "Library" tab as a guide.** 
> 
> Select a disease listed in the Library (e.g., *Potato Late Blight* or *Citrus Canker*). With Disease Search, you can download any image of the disease and use it for analysis. The system will demonstrate its ability to find the exact scientific treatment from the indexed PDFs and present it based on the language that you select in the settings section.

---

## 🏁 Access & Deployment

This project is deployed as a high-performance **PWA (Progressive Web App)** on Vercel.

### 1. Live URL
Access the live application here: [agri-guide-ai-lilac.vercel.app]

### 2. Authentication
The application uses **Firebase Authentication**.
- **Login Requirement:** Access to the application requires a **Google (Gmail) account**. Please use the "Continue with Google" button on the login screen. Other login methods (like email/password) are intentionally disabled for a streamlined and secure experience.

### 3. Mobile Experience
For the best experience (including camera access), open the URL on a mobile device and use the "Add to Home Screen" feature to install it as a native-feeling app.

---
*Developed as a Final Project for the AI in Practice Program - 2026*
