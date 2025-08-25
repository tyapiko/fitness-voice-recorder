# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `docker-compose up --build` - Start the development environment with React hot reload
- `docker-compose down` - Stop and remove containers
- `docker-compose logs -f app` - View application logs

### Application Commands (inside container)
- `npm run dev` - Start Vite development server (runs on 0.0.0.0:3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Architecture Overview

### Core Technologies
- **Frontend**: React 18 + Vite build system
- **Storage**: IndexedDB with Dexie.js ORM for client-side persistence
- **Voice Recognition**: Web Speech API for Japanese speech input
- **AI Processing**: Local LLM integration via LM Studio (localhost:1234)
- **Deployment**: Docker containerized development environment

### Application Structure

This is a **self-weight training recorder** that uses voice input for workout logging. The app has evolved from a dual-mode system to focus specifically on bodyweight exercises.

#### Tab-Based Navigation System
The app uses a bottom tab navigation with three main sections:
- **Record Tab**: Primary voice recording interface with today's progress
- **Progress Tab**: Statistics, streaks, and weekly activity charts  
- **History Tab**: Calendar-based record browsing and management

#### Data Flow Architecture
1. **Voice Input** → Web Speech API recognizes Japanese speech
2. **LLM Processing** → Local LLM at localhost:1234 structures natural language into exercise data
3. **Data Storage** → IndexedDB stores records with automatic date parsing
4. **UI Updates** → React state management updates all tabs in real-time

### Key Components

#### Data Processing Pipeline
- `VoiceRecorder.jsx` - Handles speech recognition and recording flow
- `utils/llmClient.js` - Manages LLM communication and prompt engineering
- `hooks/useIndexedDB.js` - Database operations and schema management
- `hooks/useSpeechRecognition.js` - Web Speech API integration

#### Voice Recognition Features
- **Date Parsing**: Supports natural language dates ("8月24日", "昨日", "3日前")
- **Exercise Correction**: AI-powered correction of speech recognition errors
- **Japanese Language**: Optimized prompts for Japanese exercise terminology

### Data Schema

Records are stored with the following structure:
```javascript
{
  id: "uuid",
  timestamp: Date, // Supports past dates via voice input
  raw_input: "腕立て伏せ20回3セット", 
  exercises: [{
    name: "腕立て伏せ",
    weight: 0, // Always 0 for bodyweight
    reps: 20,
    sets: 3,
    volume: 60 // reps * sets for bodyweight
  }]
}
```

### LLM Integration Requirements

**Critical**: The app requires LM Studio running on localhost:1234 with a Japanese-capable model. The LLM processes natural speech input and:
- Extracts exercise names, reps, sets, and optional dates
- Corrects common speech recognition errors (住宅伏せ → 腕立て伏せ)
- Returns structured JSON for database storage
- Handles relative dates (昨日, 3日前) and absolute dates (8月24日)

### Development Notes

#### Voice Input Flow
The voice recording process follows: Speech → Recognition → LLM Processing → Date Parsing → IndexedDB Storage → UI Update

#### Mobile-First Design
The UI is optimized for mobile devices with:
- Large touch targets (44px minimum)
- Bottom navigation for thumb accessibility  
- Responsive grid layouts that adapt to screen size
- Sticky headers and proper scroll handling

#### State Management
App state flows from the main App.jsx component down to tabs, with IndexedDB as the source of truth. The `useIndexedDB` hook manages all database operations and provides reactive data updates.