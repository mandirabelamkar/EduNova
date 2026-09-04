const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const frontendDirectory = path.resolve(__dirname, '..', 'frontend');
const stateFile = path.resolve(__dirname, 'data', 'state.json');
const port = Number(process.env.PORT) || 8000;
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8'
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify(payload));
}

function readState() {
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  if (state.users) return state;
  return { users: { 'guest@edunova.local': { password: '', ...state } } };
}

function writeState(state) {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function updateStreak(user) {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  if (user.lastActive === todayKey) return;
  if (!user.lastActive) {
    user.streak = 1;
  } else {
    const previous = new Date(`${user.lastActive}T00:00:00Z`);
    const daysSinceActive = Math.round((Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - previous.getTime()) / 86400000);
    user.streak = daysSinceActive === 1 ? (user.streak || 0) + 1 : 1;
  }
  user.lastActive = todayKey;
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    request.on('error', reject);
  });
}

async function handleApi(request, response, requestUrl) {
  if (requestUrl.pathname === '/api/health' && request.method === 'GET') {
    sendJson(response, 200, { status: 'ok', service: 'edunova-backend' });
    return true;
  }

  if (requestUrl.pathname === '/api/ai/coach' && request.method === 'POST') {
    try {
      const { subject, question, choices, correctAnswer, explanation } = await readRequestBody(request);
      if (!question || !correctAnswer) { sendJson(response, 400, { error: 'Question and answer are required' }); return true; }
      if (!process.env.OPENAI_API_KEY) { sendJson(response, 503, { error: 'AI API key is not configured' }); return true; }
      const aiResponse = await fetch(process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          temperature: 0.4,
          max_tokens: 220,
          messages: [
            { role: 'system', content: 'You are EduNova AI Coach. Explain school questions simply for a student. Give a short concept explanation, one hint, and one encouraging next step. Do not be verbose.' },
            { role: 'user', content: JSON.stringify({ subject, question, choices, correctAnswer, explanation }) }
          ]
        })
      });
      const payload = await aiResponse.json();
      if (!aiResponse.ok) { sendJson(response, 502, { error: payload.error?.message || 'AI service request failed' }); return true; }
      sendJson(response, 200, { answer: payload.choices?.[0]?.message?.content || 'Try breaking the question into smaller steps.' });
    } catch (error) { sendJson(response, 502, { error: error.message }); }
    return true;
  }

  if (requestUrl.pathname === '/api/auth/register' && request.method === 'POST') {
    try {
      const { name, email, password } = await readRequestBody(request);
      const userKey = String(email || '').trim().toLowerCase();
      if (!name || !userKey || !password) { sendJson(response, 400, { error: 'Name, email and password are required' }); return true; }
      const state = readState();
      if (state.users[userKey]) { sendJson(response, 409, { error: 'Account already exists' }); return true; }
      state.users[userKey] = {
        password,
        user: { name, level: 1, xp: 0, coins: 0, badges: 0, streak: 0, lastActive: null },
        quests: { math: { progress: 0, goal: 5, reward: 20, claimed: false }, reading: { progress: 0, goal: 10, reward: 15, claimed: false }, subject: { progress: 0, goal: 1, reward: 25, claimed: false } },
        quiz: { subject: 'math', question: 1, total: 50, correct: 0, answered: false }
      };
      writeState(state);
      sendJson(response, 201, { email: userKey, ...state.users[userKey] });
    } catch (error) { sendJson(response, 400, { error: error.message }); }
    return true;
  }

  if (requestUrl.pathname === '/api/auth/login' && request.method === 'POST') {
    try {
      const { email, password } = await readRequestBody(request);
      const userKey = String(email || '').trim().toLowerCase();
      const account = readState().users[userKey];
      if (!account || account.password !== password) { sendJson(response, 401, { error: 'Invalid email or password' }); return true; }
      sendJson(response, 200, { email: userKey, ...account });
    } catch (error) { sendJson(response, 400, { error: error.message }); }
    return true;
  }

  if (requestUrl.pathname === '/api/state' && request.method === 'GET') {
    const userKey = request.headers['x-user'];
    const account = readState().users[userKey];
    if (!account) { sendJson(response, 401, { error: 'Login required' }); return true; }
    sendJson(response, 200, { user: account.user, quests: account.quests, quiz: account.quiz });
    return true;
  }

  if (requestUrl.pathname === '/api/state' && request.method === 'POST') {
    try {
      const update = await readRequestBody(request);
      const state = readState();
      const userKey = request.headers['x-user'];
      const account = state.users[userKey];
      if (!account) { sendJson(response, 401, { error: 'Login required' }); return true; }
      updateStreak(account.user);
      if (update.user) account.user = { ...account.user, ...update.user };
      if (update.quests) account.quests = { ...account.quests, ...update.quests };
      if (update.quiz) account.quiz = { ...account.quiz, ...update.quiz };
      writeState(state);
      sendJson(response, 200, { user: account.user, quests: account.quests, quiz: account.quiz });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return true;
  }

  return false;
}

function serveFrontend(request, response) {
  const requestedPath = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.slice(1);
  const filePath = path.resolve(frontendDirectory, relativePath);

  if (!filePath.startsWith(`${frontendDirectory}${path.sep}`)) {
    sendJson(response, 403, { error: 'Forbidden' });
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      sendJson(response, 404, { error: 'Page not found' });
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  handleApi(request, response, requestUrl).then(handled => {
    if (handled) return;
    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'Method not allowed' });
      return;
    }
    serveFrontend(request, response);
  });
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the existing EduNova server or run with another port, for example: $env:PORT=8010; npm start`);
    process.exitCode = 1;
    return;
  }
  console.error(error);
});

server.listen(port, () => {
  console.log(`EduNova running at http://localhost:${port}`);
});
