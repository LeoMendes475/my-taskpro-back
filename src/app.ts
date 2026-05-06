import express from 'express';
import { errorHandler } from './shared/middlewares/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { taskRoutes } from './routes/task.routes';

const app = express();

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Rota não encontrada' });
});

// Global error handler (must be last)
app.use(errorHandler);

export { app };
