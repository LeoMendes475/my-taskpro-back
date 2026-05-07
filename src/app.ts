import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { swaggerDocument } from './shared/docs/swagger'
import { errorHandler } from './shared/middlewares/errorHandler'
import { authRoutes } from './routes/auth.routes'
import { taskRoutes } from './routes/task.routes'

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  credentials: true,
}))

app.use(express.json())

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'Task Manager API',
  swaggerOptions: {
    persistAuthorization: true, // keeps token between page refreshes
  },
}))

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Rota não encontrada' })
})

// Global error handler
app.use(errorHandler)

export { app }
