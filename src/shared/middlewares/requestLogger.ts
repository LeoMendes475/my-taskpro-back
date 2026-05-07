import { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'
import { logger } from '../observability/logger'
import {
  httpRequestsTotal,
  httpRequestDuration,
  httpRequestsInFlight,
} from '../observability/metrics'

declare global {
  namespace Express {
    interface Request {
      requestId: string
      startTime: [number, number]
    }
  }
}

// Normalize dynamic route params so metrics don't explode cardinality
// e.g. /tasks/some-uuid → /tasks/:id
function normalizeRoute(req: Request): string {
  const baseRoute = req.route?.path ?? req.path
  return `${req.baseUrl ?? ''}${baseRoute}`
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  req.requestId = randomUUID()
  req.startTime = process.hrtime()

  httpRequestsInFlight.inc({ method: req.method })

  res.on('finish', () => {
    const [sec, ns] = process.hrtime(req.startTime)
    const durationSeconds = sec + ns / 1e9
    const route = normalizeRoute(req)
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    }

    httpRequestsTotal.inc(labels)
    httpRequestDuration.observe(labels, durationSeconds)
    httpRequestsInFlight.dec({ method: req.method })

    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'

    logger[level]('HTTP request', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      route,
      statusCode: res.statusCode,
      durationMs: Math.round(durationSeconds * 1000),
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    })
  })

  next()
}
