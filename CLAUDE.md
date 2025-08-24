# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
# Start development environment
docker-compose up --build

# View logs
docker-compose logs -f app

# Rebuild containers
docker-compose down && docker-compose up --build
```

### Build & Deploy
```bash
# Build production version
npm run build

# Preview production build
npm run preview
```

## Architecture Overview

This is a Japanese fitness workout recording app using voice input and local AI processing.

### Core Data Flow
1. **Voice Input** → Web Speech API (Japanese) → Raw text
2. **AI Processing** → Local LLM (localhost:1234) → Structured workout data
3. **Storage** → IndexedDB (browser-local) → Persistent records

### Key Components

**VoiceRecorder.jsx**: Handles Web Speech API integration and user interaction flow. Coordinates between speech recognition, LLM processing, and data saving.

**llmClient.js**: Manages communication with local LLM server (localhost:1234). Includes sophisticated fallback parsing using regex patterns when LLM is unavailable. Critical dependency: LM Studio running on port 1234.

**useIndexedDB.js**: Encapsulates all database operations using Dexie.js wrapper for IndexedDB. Handles workout record CRUD operations with proper error handling.

**Data Schema**: Workout records contain `exercises` array with structured fields: name, weight, weight_unit, reps, sets, volume (calculated field).

### External Dependencies

**LM Studio Requirement**: App expects local LLM server at `http://localhost:1234/v1/chat/completions`. Without this, falls back to pattern matching. Recommended model: Qwen2.5-7B-Instruct for Japanese support.

**Browser Compatibility**: Requires Web Speech API support (Chrome/Firefox). Uses `webkitSpeechRecognition` with Japanese language settings.

### Development Notes

**Hot Reload**: Vite configured with `--host 0.0.0.0` for Docker container access.

**Error Handling**: LLM failures gracefully degrade to regex pattern matching. IndexedDB failures show user alerts.

**State Management**: Simple useState/useEffect pattern. Records loaded on app initialization, real-time updates for new/deleted records.

**Voice Input Patterns**: Optimized for Japanese fitness terminology like "ベンチプレス60kg10回3セット" (Bench press 60kg 10 reps 3 sets).

### Fallback System

When LLM is unavailable, `fallbackParse()` function uses regex patterns to extract:
- Exercise name + weight + reps + sets combinations
- Multiple Japanese and English variations
- Defaults to raw input if no patterns match