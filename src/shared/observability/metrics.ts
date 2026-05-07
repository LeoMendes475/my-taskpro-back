import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client'

export const registry = new Registry()
registry.setDefaultLabels({ app: 'task-manager' })

// Collect Node.js default metrics (CPU, memory, event loop, GC...)
collectDefaultMetrics({ register: registry })

// ── HTTP metrics ──────────────────────────────────────────────────────────────

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
})

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [registry],
})

export const httpRequestsInFlight = new Gauge({
  name: 'http_requests_in_flight',
  help: 'Requisições HTTP em andamento',
  labelNames: ['method'],
  registers: [registry],
})

// ── Business metrics ──────────────────────────────────────────────────────────

export const tasksCreatedTotal = new Counter({
  name: 'tasks_created_total',
  help: 'Total de tarefas criadas',
  registers: [registry],
})

export const tasksCompletedTotal = new Counter({
  name: 'tasks_completed_total',
  help: 'Total de tarefas marcadas como concluídas',
  registers: [registry],
})

export const tasksDeletedTotal = new Counter({
  name: 'tasks_deleted_total',
  help: 'Total de tarefas deletadas',
  registers: [registry],
})

export const authLoginTotal = new Counter({
  name: 'auth_login_total',
  help: 'Total de tentativas de login',
  labelNames: ['result'], // 'success' | 'failure'
  registers: [registry],
})

export const authRegisterTotal = new Counter({
  name: 'auth_register_total',
  help: 'Total de cadastros realizados',
  registers: [registry],
})
