import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../errors/AppError'
import { logger } from '../observability/logger'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    })
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      status: 'validation_error',
      message: 'Erro de validação',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  logger.error('Unhandled error', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: err.stack,
  })

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  })
}
