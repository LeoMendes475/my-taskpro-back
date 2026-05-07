import { CreateTaskDTO, UpdateTaskDTO } from "../dtos/taskDTOs";

export interface TaskEntity {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  durationMinutes: number | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskRepository {
  create(data: CreateTaskDTO & { userId: string }): Promise<TaskEntity>;
  findAllByUser(userId: string): Promise<TaskEntity[]>;
  findById(id: string): Promise<TaskEntity | null>;
  update(id: string, data: UpdateTaskDTO): Promise<TaskEntity>;
  delete(id: string): Promise<void>;
}
