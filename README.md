# UHH-MAZE-ING  
**An AI-Powered ML Learning Maze Adventure**  
*Built by CS Girlies for the Google Hackathon 2025*  

[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)](https://reactjs.org)  
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)  
[![Vite](https://img.shields.io/badge/Vite-5.0+-purple?logo=vite)](https://vitejs.dev/)  
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)  
[![Flask](https://img.shields.io/badge/Flask-3.0+-black?logo=flask)](https://flask.palletsprojects.com/)  
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-green?logo=google)](https://ai.google.dev/)


---

## Overview

**UHH-MAZE-ING** is an immersive, gamified learning experience that teaches **Machine Learning concepts** through a **maze-based adventure**.

- **AI-Generated Quizzes** powered by **Google Gemini 2.5 Flash**  
- **Dynamic Study Materials** (PDFs) fetched from backend  
- **Progressive Difficulty** with 3 levels per topic  
- **Real-time Feedback** with lives, score, and time tracking  
- **Multilingual Support** (EN, ES, FR, HI)  
- **Offline-First** with IndexedDB caching  

---

## Tech Stack

| Layer       | Technology |
|------------|------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **State**    | Zustand (lightweight, reactive) |
| **Storage**  | Dexie.js (IndexedDB wrapper) |
| **i18n**     | i18next + react-i18next |
| **Animations** | Framer Motion |
| **Backend**  | Python Flask + Flask-CORS |
| **AI**       | Google Gemini (via `google-genai`) |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## Project Structure

```bash
CS-GIRLIES-Hackathon/
├── backend/
│   ├── app.py                  # Flask API (quiz + PDF server)
│   ├── requirements.txt        # Flask, google-genai, python-dotenv
│   ├── study-materials/        # PDFs: topic_level.pdf
│   └── .env                    # GEMINI_API_KEY
│
├── src/
│   ├── components/
│   │   ├── game/               # MazeCanvas, MiniMap
│   │   ├── modals/             # All modals (Quiz, Victory, etc.)
│   │   └── LevelPdfViewer.tsx  # Live PDF preview
│   │
│   ├── services/
│   │   ├── geminiService.ts    # AI quiz generation
│   │   └── mazeGenerator.ts    # Procedural maze logic
│   │
│   ├── stores/
│   │   ├── gameStore.ts        # Player, maze, pause state
│   │   └── quizProgressStore.ts # Score, level tracking
│   │
│   ├── data/
│   │   └── questionBank.ts     # ML topics & icons
│   │
│   └── assets/                 # Sprites, icons, fonts
│
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## Features

| Feature | Status |
|-------|--------|
| AI-Generated Quizzes | Done |
| PDF Study Material Preview | Done |
| Auto-Download on 5/7 Correct | Done |
| Player Freezes During Quiz | Done |
| Lives System (5 hearts) | Done |
| Score & Time Tracking | Done |
| Multilevel Progression | Done |
| Responsive Pixel Art UI | Done |
| Multilingual (4 languages) | Done |

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/devanshx72/CS-GIRLIES-Hackathon.git
cd CS-GIRLIES-Hackathon
```

---

### 2. Backend Setup (Flask)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate    # Linux/Mac
# or
venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Set your Gemini API Key
echo "GEMINI_API_KEY=your_key_here" > .env

# Run server
python app.py
```

> Server runs on: `http://localhost:8000`

---

### 3. Frontend Setup (React + Vite)

```bash
# From root directory
cd ..

# Install frontend dependencies
npm install

# Set backend URL
echo "VITE_BACKEND_URL=http://localhost:8000" > .env

# Start dev server
npm run dev
```

> App runs on: `http://localhost:5173`

---

## Environment Variables

### Backend `.env`
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend `.env`
```env
VITE_BACKEND_URL=http://localhost:8000
```

---

## Available Scripts

| Script | Description |
|-------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## PDF Naming Convention

Place study materials in `backend/study-materials/`:

```
introduction_to_ml_1.pdf
introduction_to_ml_2.pdf
working_with_data_1.pdf
...
```

> Auto-matched by: `topic_name_level.pdf`

---

## Contributing

We welcome contributions!  
1. Fork the repo  
2. Create a feature branch  
3. Commit changes  
4. Open a Pull Request  


---

## License

MIT © 2025 CS Girlies

---

**Made with love, AI, and a lot of coffee**  
**#CSGirlies #GoogleHackathon #AIEd #WomenInTech**

---

> **Star this repo if you love learning ML through mazes!**