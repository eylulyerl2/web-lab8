import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

const COURSES = [
  { id: 1, title: 'Introduction to Programming', credits: 6 },
  { id: 2, title: 'Web Programming', credits: 5 },
  { id: 3, title: 'Database Management', credits: 5 },
];

const ROBOTS_TXT = 'User-agent: *\nDisallow: /api/\n';

let requestsServed = 0;

function logger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

function requestCounter(req, res, next) {
  requestsServed += 1;
  next();
}

// Middleware is registered before the routes so it sees every request.
app.use(logger);
app.use(requestCounter);

app.get('/hello', (req, res) => {
  res.type('text/plain').send("Hello from Eylül Yerli's server");
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(ROBOTS_TXT);
});

app.get('/old-page', (req, res) => {
  res.redirect(301, '/hello');
});

app.get('/api/courses', (req, res) => {
  res.json(COURSES);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

app.get('/api/headers', (req, res) => {
  res.json({
    userAgent: req.get('User-Agent') ?? null,
    accept: req.get('Accept') ?? null,
  });
});

app.post('/api/subscribe', (req, res) => {
  res.status(201).json({ subscribed: true });
});

app.get('/api/admin', (req, res) => {
  res.status(403).json({ error: 'Forbidden' });
});

app.get('/api/stats', (req, res) => {
  res.json({ requestsServed });
});

// 404 fallback: registered last so it never hides a real route.
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.status(404).type('text/plain').send('404 - Page not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});