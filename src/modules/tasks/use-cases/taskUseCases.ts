import { AppError } from '../../../shared/errors/AppError';
import { CreateTaskDTO, UpdateTaskDTO } from '../dtos/taskDTOs';
import { ITaskRepository, TaskEntity } from '../repositories/ITaskRepository';

// ─── Create ────────────────────────────────────────────────────────────────

export class CreateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(data: CreateTaskDTO & { userId: string }): Promise<TaskEntity> {
    return this.taskRepository.create(data);
  }
}

// ─── List (per user) ────────────────────────────────────────────────────────

export class ListTasksUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(userId: string): Promise<TaskEntity[]> {
    return this.taskRepository.findAllByUser(userId);
  }
}

// ─── Update ─────────────────────────────────────────────────────────────────

export class UpdateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(id: string, userId: string, data: UpdateTaskDTO): Promise<TaskEntity> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new AppError('Tarefa não encontrada', 404);
    }

    if (task.userId !== userId) {
      throw new AppError('Sem permissão para editar esta tarefa', 403);
    }

    return this.taskRepository.update(id, data);
  }
}

// ─── Delete ─────────────────────────────────────────────────────────────────

export class DeleteTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(id);

    if (!task) {
      throw new AppError('Tarefa não encontrada', 404);
    }

    if (task.userId !== userId) {
      throw new AppError('Sem permissão para remover esta tarefa', 403);
    }

    await this.taskRepository.delete(id);
  }
}
