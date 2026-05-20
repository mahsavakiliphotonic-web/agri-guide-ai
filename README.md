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
<img width="975" height="436" alt="image" src="https://github.com/user-attachments/assets/288db279-4b8a-4dbd-9447-b4266a07a587" />

<img width="975" height="436" alt="image" src="https://github.com/user-attachments/assets/ef6df5a3-5ec1-4766-89e4-f28c5122db56" />


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

<img width="975" height="436" alt="image" src="https://github.com/user-attachments/assets/08902912-1297-459d-9427-6bfb3bd3698b" />

<table>
  <tr>
    <td><img width="1912" height="797" alt="image" src="https://github.com/user-attachments/assets/4698ff7a-0b7c-4d08-85be-f30b25931547" /></td>
    <td><img width="1903" height="790" alt="image" src="https://github.com/user-attachments/assets/3dc39bb9-b5c2-498f-be13-7bcbd086e0be" /></td>
  </tr>
</table>

<table>
  <tr>
    <td><img width="1915" height="792" alt="image" src="https://github.com/user-attachments/assets/1e09bf6a-a5ea-4518-8c1c-d21b30f86939" /></td>
    <td><img width="1913" height="788" alt="image" src="https://github.com/user-attachments/assets/e11b7404-09fd-4123-b154-ccea19c08e33" /></td>
  </tr>
</table>

<table>
  <tr>
    <td><img width="1910" height="782" alt="image" src="https://github.com/user-attachments/assets/119f92f1-32a9-459f-ad7a-1a3220b1c146" /></td>
    <td><img width="1917" height="785" alt="image" src="https://github.com/user-attachments/assets/5c07ff6e-479e-4c84-9061-cf2148e400a2" /></td>
  </tr>
</table>
---

## 🏁 Access & Deployment

This project is deployed as a high-performance **PWA (Progressive Web App)** on Vercel.

### 1. Live URL
Access the live application here: [**AgriGuide AI Live App**](https://agri-guide-ai-lilac.vercel.app)

### 2. Authentication
The application uses **Firebase Authentication**.
- **Login Requirement:** Access to the application requires a **Google (Gmail) account**. Please use the "Continue with Google" button on the login screen. Other login methods (like email/password) are intentionally disabled for a streamlined and secure experience.

-<table>
  <tr>
    <td><img width="100" height="200" alt="image" src="https://github.com/user-attachments/assets/0c68b609-1b25-4c84-918b-9077ae141996" /></td>
    <td><img width="100" height="200" alt="image" src="https://github.com/user-attachments/assets/253c868f-66bb-4ef1-9d53-0384b3848e76" /></td>
  </tr>
</table>

### 3. Mobile Experience
For the best experience, open the URL on a mobile device and use the "Add to Home Screen" feature to install it as a native-feeling app.
<img width="400" height="200" alt="WhatsApp Image 2026-05-20 at 9 38 56 AM" src="https://github.com/user-attachments/assets/7900d2d4-cbfd-466a-9010-3b6bbd64dcd2" />
<img width="400" height="200" alt="WhatsApp Image 2026-05-20 at 9 38 56 AM (1)" src="https://github.com/user-attachments/assets/7777c586-15f6-4cb1-862e-4f18abee3a26" />
<img width="400" height="200" alt="WhatsApp Image 2026-05-20 at 9 38 56 AM (2)" src="https://github.com/user-attachments/assets/451394fc-0113-455f-8082-b5b214530677" />
<img width="400" height="200" alt="WhatsApp Image 2026-05-20 at 9 38 57 AM" src="https://github.com/user-attachments/assets/cd4f85b5-c717-40a0-8836-a7b4ef4636c8" />

---
*Developed as a Final Project for the AI in Practice Program - 2026*
