# EduNova

A gamified learning platform with interactive quizzes, AI Coach guidance, personalized practice, XP, badges, coins, leaderboards and daily streaks.

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

If you see `EADDRINUSE` or `Port 8000 is already in use`, the app is already running in another terminal. Use that existing server, or stop it with `Ctrl + C` and run `npm start` again. To use another port:

```powershell
$env:PORT=8010
npm start
```

Then open `http://localhost:8010`.

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
