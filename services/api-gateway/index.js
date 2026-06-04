import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { URL } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const jwtGuard = (req, res, next) => {
  if (req.path.startsWith('/auth')) return next();
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or malformed.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-name'] = decoded.name;
    req.headers['x-user-role'] = decoded.role || 'student';
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-name', 'x-user-phone', 'x-user-role'],
}));
app.options('*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-name', 'x-user-phone', 'x-user-role'],
}));
app.use(limiter);

app.get('/health', (req, res) => {
  res.json({ service: 'api-gateway', status: 'ok' });
});

app.use(jwtGuard);

const proxies = [
  { path: '/auth', target: process.env.AUTH_SERVICE_URL },
  { path: '/bookings', target: process.env.BOOKING_SERVICE_URL },
  { path: '/events', target: process.env.EVENTS_SERVICE_URL },
  { path: '/marketplace', target: process.env.MARKETPLACE_SERVICE_URL },
  { path: '/lost-found', target: process.env.LOST_FOUND_SERVICE_URL },
  { path: '/carpooling', target: process.env.CARPOOLING_SERVICE_URL },
  { path: '/notifications', target: process.env.NOTIFICATION_SERVICE_URL },
];

proxies.forEach(({ path, target }) => {
  if (!target) {
    console.warn(`[api-gateway] WARNING: No target for ${path}`);
    return;
  }
  console.log(`[api-gateway] Proxy: ${path} → ${target}`);

  app.use(path, (req, res) => {
    const targetUrl = new URL(target);
    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || 80,
      path: req.originalUrl,
      method: req.method,
      headers: {
        ...req.headers,
        host: targetUrl.host,
      },
    };

    console.log(`[api-gateway] → ${req.method} ${req.originalUrl} to ${target}`);

    const proxyReq = http.request(options, (proxyRes) => {
      console.log(`[api-gateway] ← ${proxyRes.statusCode} ${req.method} ${req.originalUrl}`);
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error(`[api-gateway] Proxy error for ${path}:`, err.message);
      res.status(502).json({ message: 'Service unavailable.' });
    });

    req.pipe(proxyReq, { end: true });
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`[api-gateway] Listening on port ${PORT}`);
});