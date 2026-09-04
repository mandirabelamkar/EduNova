# EduNova

A gamified learning app for Smart India Hackathon with quizzes, quests, XP, badges, coins, leaderboard and daily streaks.

## Project structure

```text
frontend/
  *.html
  style.css
  script.js
backend/
  server.js
  package.json
```

## Requirements

- Node.js 18 or newer
- npm

## Run from terminal

Open PowerShell and run these exact commands:

```powershell
cd "C:\Users\DELL\Downloads\gamified-learning-frontend"
npm --prefix backend install
npm start
```

The terminal should show:

```text
EduNova running at http://localhost:8000
```

Open the app in a browser:

```text
http://localhost:8000
```

You can also check that the backend is running:

```text
http://localhost:8000/api/health
```

## Development mode

```powershell
cd "C:\Users\DELL\Downloads\gamified-learning-frontend"
npm run dev
```

After starting the server, register a new account or use the guest option. Each account has separate XP, quiz progress and streak data.

The AI Coach, AI Practice Lab and personalized study plan currently use the app's built-in learning logic and do not require an API key.

## Stop the server

In the terminal running the server, press:

```text
Ctrl + C
```
