import prisma from '../../../shared/container/prisma';
import { CreateTaskDTO, UpdateTaskDTO } from '../dtos/taskDTOs';
import { ITaskRepository, TaskEntity } from './ITaskRepository';

export class TaskRepository implements ITaskRepository {
  async create(data: CreateTaskDTO & { userId: string }): Promise<TaskEntity> {
    return prisma.task.create({ data });
  }

  async findAllByUser(userId: string): Promise<TaskEntity[]> {
    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<TaskEntity | null> {
    return prisma.task.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateTaskDTO): Promise<TaskEntity> {
    return prisma.task.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }
}
