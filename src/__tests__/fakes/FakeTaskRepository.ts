import { ITaskRepository, TaskEntity } from "../../modules/tasks/repositories/ITaskRepository";
import { CreateTaskDTO, UpdateTaskDTO } from "../../modules/tasks/dtos/taskDTOs";
import { AppError } from "../../shared/errors/AppError";

export class FakeTaskRepository implements ITaskRepository {
  private tasks: TaskEntity[] = [];

  async create(data: CreateTaskDTO & { userId: string }): Promise<TaskEntity> {
    const task: TaskEntity = {
      id: `task-${this.tasks.length + 1}`,
      title: data.title,
      category: data.category,
      completed: false,
      durationMinutes: data.durationMinutes ?? null,
      userId: data.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.push(task);
    return task;
  }

  async findAllByUser(userId: string): Promise<TaskEntity[]> {
    return this.tasks.filter((t) => t.userId === userId);
  }

  async findById(id: string): Promise<TaskEntity | null> {
    return this.tasks.find((t) => t.id === id) ?? null;
  }

  async update(id: string, data: UpdateTaskDTO): Promise<TaskEntity> {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new AppError("Tarefa não encontrada", 404);
    this.tasks[idx] = { ...this.tasks[idx], ...data, updatedAt: new Date() };
    return this.tasks[idx];
  }

  async delete(id: string): Promise<void> {
    this.tasks = this.tasks.filter((t) => t.id !== id);
  }

  seed(task: TaskEntity) { this.tasks.push(task); }
  clear() { this.tasks = []; }
}
