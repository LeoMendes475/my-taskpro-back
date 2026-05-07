import { Request, Response } from "express";
import { createTaskSchema, taskIdSchema, updateTaskSchema } from "../dtos/taskDTOs";
import { TaskRepository } from "../repositories/TaskRepository";
import {
  CreateTaskUseCase,
  DeleteTaskUseCase,
  ListTasksUseCase,
  UpdateTaskUseCase,
} from "../use-cases/taskUseCases";

export class TaskController {
  async create(req: Request, res: Response): Promise<Response> {
    const body = createTaskSchema.parse(req.body);
    const { id: userId } = req.user;

    const taskRepository = new TaskRepository();
    const createTask = new CreateTaskUseCase(taskRepository);

    const task = await createTask.execute({ ...body, userId });

    return res.status(201).json(task);
  }

  async list(req: Request, res: Response): Promise<Response> {
    const { id: userId } = req.user;

    const taskRepository = new TaskRepository();
    const listTasks = new ListTasksUseCase(taskRepository);

    const tasks = await listTasks.execute(userId);

    return res.status(200).json(tasks);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = taskIdSchema.parse(req.params);
    const body = updateTaskSchema.parse(req.body);
    const { id: userId } = req.user;

    const taskRepository = new TaskRepository();
    const updateTask = new UpdateTaskUseCase(taskRepository);

    const task = await updateTask.execute(id, userId, body);

    return res.status(200).json(task);
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = taskIdSchema.parse(req.params);
    const { id: userId } = req.user;

    const taskRepository = new TaskRepository();
    const deleteTask = new DeleteTaskUseCase(taskRepository);

    await deleteTask.execute(id, userId);

    return res.status(204).send();
  }
}
