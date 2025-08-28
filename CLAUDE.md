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

**Note**: No linting or testing commands are available in this project. Check code quality manually before committing.

### Prerequisites for Development
- **LM Studio**: Must be running on localhost:1234 with a Japanese-capable model (recommended: Qwen2.5-7B-Instruct)
- **Browser**: Chrome 100+ or Firefox 100+ required for Web Speech API support
- **Memory**: 8GB+ recommended for local LLM operation

### Production Deployment Commands

#### Local Production Build
- `docker-compose -f docker-compose.prod.yml up --build` - Build and run production version locally
- `npm run build` - Build for production (inside container)

#### GCP Deployment
- `./deploy.sh` - Interactive deployment script for GCP
- `gcloud builds submit --config=cloudbuild.yaml .` - Deploy to Cloud Run
- `gcloud app deploy app.yaml` - Deploy to App Engine

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
The app uses a top sticky navigation with three main sections:
- **Record Tab**: Primary voice recording interface with today's progress
- **Progress Tab**: Statistics, streaks, and body part level system  
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

#### Exercise Management System
- `data/exerciseTypes.js` - Fixed exercise menu with 15 predefined exercises plus custom exercise support
- `EXERCISE_TYPES` object containing exercise definitions with keywords for speech recognition
- `BODY_PART_LEVELS` system with 7 progressive levels (初心者 → レジェンド) 
- `calculateLevel()` function determines user level based on total repetitions
- Custom exercise addition with AI-powered body part detection via LLM
- Keyword-based fuzzy matching using Levenshtein distance algorithm

#### Voice Recognition Features
- **Date Parsing**: Supports natural language dates ("8月24日", "昨日", "3日前")
- **Exercise Correction**: AI-powered correction of speech recognition errors
- **Japanese Language**: Optimized prompts for Japanese exercise terminology
- **Custom Exercise Support**: Dynamic recognition of user-added exercises
- **Input Validation**: Minimal validation approach - only blocks obvious invalid inputs (test, hello, etc.) while allowing natural Japanese input

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

**Development**: The app uses LM Studio running on localhost:1234 with a Japanese-capable model.
**Production**: Supports multiple LLM providers via environment variables:
- OpenAI GPT-4/3.5-turbo (recommended for production)
- Google Gemini API
- Anthropic Claude API
- Any OpenAI-compatible API

The LLM processes natural speech input and:
- Extracts exercise names, reps, sets, and optional dates
- Corrects common speech recognition errors (住宅伏せ → 腕立て伏せ)
- Returns structured JSON for database storage
- Handles relative dates (昨日, 3日前) and absolute dates (8月24日)

### Environment Configuration

Create `.env.production` file based on `.env.example`:
```bash
# Production LLM API (choose one)
VITE_LLM_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_LLM_API_KEY=your_openai_api_key_here

# Alternative: Google Gemini
# VITE_LLM_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
# VITE_LLM_API_KEY=your_google_api_key_here
```

### Development Notes

#### Voice Input Flow
The voice recording process follows: Speech → Recognition → LLM Processing → Date Parsing → IndexedDB Storage → UI Update

#### Mobile-First Design
The UI is optimized for mobile devices with:
- Large touch targets (44px minimum)
- Top navigation for thumb accessibility  
- Responsive grid layouts that adapt to screen size
- Sticky headers and proper scroll handling

#### State Management
App state flows from the main App.jsx component down to tabs, with IndexedDB as the source of truth. The `useIndexedDB` hook manages all database operations and provides reactive data updates.

#### Error Handling and User Experience
- **User-Centric Validation**: Prioritizes usability over strict validation - legitimate inputs like "スクワット10回" should never be blocked
- **Message System**: Uses structured UI messages (success/error/info) with animations instead of basic alerts
- **Graceful Degradation**: Fallback parsing when LLM is unavailable
- **Japanese-First Design**: All prompts and error messages optimized for Japanese users

## Troubleshooting

### Voice Recognition Issues
- Ensure microphone permissions are granted in browser
- Requires HTTPS or localhost for Web Speech API
- Chrome/Firefox latest versions recommended

### LLM Connection Errors
- Verify LM Studio is running on localhost:1234
- Enable CORS in LM Studio settings if needed
- Check network connectivity and firewall settings

### Data Storage Issues  
- IndexedDB must be enabled in browser
- Private/incognito mode may have limitations
- Clear browser storage if corruption occurs

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

      
      IMPORTANT: this context may or may not be relevant to your tasks. You should not respond to this context unless it is highly relevant to your task.