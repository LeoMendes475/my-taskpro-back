import { AppError } from '../../../shared/errors/AppError'
import { CreateTaskDTO, UpdateTaskDTO } from '../dtos/taskDTOs'
import { ITaskRepository, TaskEntity } from '../repositories/ITaskRepository'
import {
  tasksCreatedTotal,
  tasksCompletedTotal,
  tasksDeletedTotal,
} from '../../../shared/observability/metrics'
import { logger } from '../../../shared/observability/logger'

// ─── Create ──────────────────────────────────────────────────────────────────

export class CreateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(data: CreateTaskDTO & { userId: string }): Promise<TaskEntity> {
    const task = await this.taskRepository.create(data)
    tasksCreatedTotal.inc()
    logger.info('Task created', { taskId: task.id, userId: data.userId, category: data.category })
    return task
  }
}

// ─── List ────────────────────────────────────────────────────────────────────

export class ListTasksUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(userId: string): Promise<TaskEntity[]> {
    return this.taskRepository.findAllByUser(userId)
  }
}

// ─── Update ──────────────────────────────────────────────────────────────────

export class UpdateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(id: string, userId: string, data: UpdateTaskDTO): Promise<TaskEntity> {
    const task = await this.taskRepository.findById(id)

    if (!task) throw new AppError('Tarefa não encontrada', 404)
    if (task.userId !== userId) throw new AppError('Sem permissão para editar esta tarefa', 403)

    const updated = await this.taskRepository.update(id, data)

    // Track completion toggle
    if (data.completed === true && !task.completed) {
      tasksCompletedTotal.inc()
      logger.info('Task completed', { taskId: id, userId })
    } else if (data.completed === false && task.completed) {
      logger.info('Task reopened', { taskId: id, userId })
    }

    return updated
  }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export class DeleteTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(id)

    if (!task) throw new AppError('Tarefa não encontrada', 404)
    if (task.userId !== userId) throw new AppError('Sem permissão para remover esta tarefa', 403)

    await this.taskRepository.delete(id)
    tasksDeletedTotal.inc()
    logger.info('Task deleted', { taskId: id, userId })
  }
}
