import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import businessRoutes from './routes/business.routes.js';
import complianceRoutes from './routes/compliance.routes.js';
import agentRoutes from './routes/agent.routes.js';
import documentRoutes from './routes/document.routes.js';
import assistantRoutes from './routes/assistant.routes.js';
import actionRoutes from './routes/action.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import sourceRoutes from './routes/source.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or if origin matches
    if (!origin) return callback(null, true);
    if (process.env.CORS_ORIGIN === '*' || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Fallback: reflect requesting origin to prevent CORS blocking in demo environments
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'AI request limit reached. Please wait.' },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/agents', aiLimiter, agentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/assistant', aiLimiter, assistantRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sources', sourceRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ComplyAI Server running on port ${PORT}`);
});
