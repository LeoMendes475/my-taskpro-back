import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { swaggerDocument } from './shared/docs/swagger'
import { errorHandler } from './shared/middlewares/errorHandler'
import { requestLogger } from './shared/middlewares/requestLogger'
import { authRoutes } from './routes/auth.routes'
import { taskRoutes } from './routes/task.routes'
import { registry } from './shared/observability/metrics'

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  credentials: true,
}))

app.use(express.json())
app.use(requestLogger)

// ── Observability endpoints ───────────────────────────────────────────────────

// Prometheus scrape endpoint
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', registry.contentType)
  res.end(await registry.metrics())
})

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Swagger ───────────────────────────────────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'Task Manager API',
  swaggerOptions: { persistAuthorization: true },
}))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)

app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Rota não encontrada' })
})

app.use(errorHandler)

export { app }
