import 'dotenv/config'
import { app } from './app'
import { logger } from './shared/observability/logger'

const PORT = process.env.PORT ?? 3333

app.listen(PORT, () => {
  logger.info(`Server started`, {
    port: PORT,
    env: process.env.NODE_ENV ?? 'development',
    docs: `http://localhost:${PORT}/docs`,
    metrics: `http://localhost:${PORT}/metrics`,
    health: `http://localhost:${PORT}/health`,
  })
})
