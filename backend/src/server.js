require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Sentry = require('@sentry/node');
const aiController = require('./controllers/ai.controller');
const healthController = require('./controllers/health.controller');

const app = express();
const PORT = process.env.PORT || 3001;

// Sentry Initialization (Placeholder)
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 1.0 });
  app.use(Sentry.Handlers.requestHandler());
}

// CORS Configuration - Restrict to Chrome Extensions
const corsOptions = {
  origin: (origin, callback) => {
    // In production, you'd add your specific extension ID here
    if (!origin || origin.startsWith('chrome-extension://')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Trust proxy for correct IP rate limiting (Required for Railway/Render)
app.set('trust proxy', 1);

// Rate Limiting: 30 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    status: 'error',
    error: 'Too many requests. Please try again in 60 seconds.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.get('/health', healthController.health);
app.post('/api/ai/process', limiter, aiController.processRequest);

// Sentry Error Handler
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ status: 'error', error: 'CORS policy violation' });
  }

  res.status(500).json({ 
    status: 'error', 
    error: 'Internal server error. Please try again.' 
  });
});

app.listen(PORT, () => {
  console.log(`[Kairo AI Backend] Server running on port ${PORT} (Env: ${process.env.NODE_ENV || 'development'})`);
});

