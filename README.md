# Sanathana Dharma App

A spiritual companion app that allows devotees to converse with Hindu deities for motivation, strength, and inner peace.

## Vision

When you feel unmotivated, depressed, anxious, or stressed — this app connects you with the divine energy of Hindu deities who guide you with wisdom from the Puranas, Ramayana, and sacred texts.

## Phases

| Phase | Feature |
|-------|---------|
| 1 | Chat with Lord Hanuma |
| 2 | Add Lord Shiva, Vishnu, Brahma, Vinayaka |
| 3 | Audio responses (deity voice) |
| 4 | Video avatar (real deity talking to user) |

## Tech Stack

- **Mobile**: React Native + Expo (TypeScript)
- **Backend**: Node.js + Express (TypeScript)
- **AI**: Claude API (`claude-sonnet-4-6`) with prompt caching
- **Streaming**: Server-Sent Events (SSE)

## Project Structure

```
├── backend/     # Node.js + Express API
└── mobile/      # React Native + Expo app
```

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Add your ANTHROPIC_API_KEY
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

## Contributing

All changes go through Pull Requests to `main`. No direct commits to main.
