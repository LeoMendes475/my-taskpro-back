import { CreateTaskUseCase, DeleteTaskUseCase, ListTasksUseCase } from "../../../modules/tasks/use-cases/taskUseCases";
import { FakeTaskRepository } from "../../fakes/FakeTaskRepository";
import { AppError } from "../../../shared/errors/AppError";

describe("DeleteTaskUseCase", () => {
  let fakeTaskRepository: FakeTaskRepository;
  let deleteTaskUseCase: DeleteTaskUseCase;
  let createTaskUseCase: CreateTaskUseCase;
  let listTasksUseCase: ListTasksUseCase;

  beforeEach(() => {
    fakeTaskRepository = new FakeTaskRepository();
    deleteTaskUseCase = new DeleteTaskUseCase(fakeTaskRepository);
    createTaskUseCase = new CreateTaskUseCase(fakeTaskRepository);
    listTasksUseCase = new ListTasksUseCase(fakeTaskRepository);
  });

  it("deve deletar a tarefa com sucesso", async () => {
    const task = await createTaskUseCase.execute({
      title: "Tarefa para deletar",
      category: "Pessoal",
      userId: "user-1",
    });

    await deleteTaskUseCase.execute(task.id, "user-1");

    const tasks = await listTasksUseCase.execute("user-1");
    expect(tasks).toHaveLength(0);
  });

  it("deve deletar apenas a tarefa especificada", async () => {
    const task1 = await createTaskUseCase.execute({ title: "Tarefa 1", category: "Pessoal", userId: "user-1" });
    await createTaskUseCase.execute({ title: "Tarefa 2", category: "Trabalho", userId: "user-1" });

    await deleteTaskUseCase.execute(task1.id, "user-1");

    const tasks = await listTasksUseCase.execute("user-1");
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("Tarefa 2");
  });

  it("deve lançar AppError 404 quando a tarefa não existe", async () => {
    await expect(
      deleteTaskUseCase.execute("id-inexistente", "user-1")
    ).rejects.toMatchObject({ statusCode: 404, message: "Tarefa não encontrada" });
  });

  it("deve lançar AppError 403 quando o usuário não é dono da tarefa", async () => {
    const task = await createTaskUseCase.execute({
      title: "Tarefa do user-1",
      category: "Pessoal",
      userId: "user-1",
    });

    await expect(
      deleteTaskUseCase.execute(task.id, "user-2")
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("não deve deletar tarefas de outros usuários", async () => {
    const task1 = await createTaskUseCase.execute({ title: "user-1 task", category: "Pessoal", userId: "user-1" });
    await createTaskUseCase.execute({ title: "user-2 task", category: "Pessoal", userId: "user-2" });

    await expect(
      deleteTaskUseCase.execute(task1.id, "user-2")
    ).rejects.toBeInstanceOf(AppError);

    const tasks = await listTasksUseCase.execute("user-1");
    expect(tasks).toHaveLength(1);
  });
});
