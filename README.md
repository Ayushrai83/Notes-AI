# 📝 Notes AI – Smart Note-Taking App
A modern, full-stack note-taking application built with **React**, **Vite**, **TypeScript**, **Appwrite**, and **AI features powered by Google Gemini**.

Users can create, edit, delete, search, and organize notes — with optional **AI Search** and **AI Summarization**.

---

## 🚀 Features
### ✔ Core Features
- Create, edit, and delete notes
- Clean and modern UI
- Secure user authentication using **Appwrite Auth**
- Real-time database using **Appwrite Database**
- Responsive design (mobile-friendly)

### 🤖 AI-Powered Features
- **AI Search** → Search notes using semantic understanding
- **AI Summarization** → Generate summaries of long notes
- Powered by **Google Gemini API**

---

## 🏗 Tech Stack
### Frontend
- React + Vite
- TypeScript
- TailwindCSS
- ShadCN UI
- Lucide Icons

### Backend (Serverless)
- Appwrite Cloud (Auth, Database, Storage)
- Vercel Serverless Functions (`/api/summarize`)

### AI
- Google Gemini API (Text-Generation & Summaries)

---

## 🔧 Environment Variables
Create a `.env.local` file:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=xxxxxx
VITE_APPWRITE_DB_ID=xxxxxx
VITE_APPWRITE_COLLECTION_ID=notes

# AI
GEMINI_API_KEY=your_gemini_key
APPWRITE_API_KEY=your_appwrite_key
