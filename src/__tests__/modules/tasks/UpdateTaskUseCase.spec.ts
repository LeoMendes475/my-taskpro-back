import { CreateTaskUseCase, UpdateTaskUseCase } from "../../../modules/tasks/use-cases/taskUseCases";
import { FakeTaskRepository } from "../../fakes/FakeTaskRepository";
import { AppError } from "../../../shared/errors/AppError";

describe("UpdateTaskUseCase", () => {
  let fakeTaskRepository: FakeTaskRepository;
  let updateTaskUseCase: UpdateTaskUseCase;
  let createTaskUseCase: CreateTaskUseCase;

  beforeEach(() => {
    fakeTaskRepository = new FakeTaskRepository();
    updateTaskUseCase = new UpdateTaskUseCase(fakeTaskRepository);
    createTaskUseCase = new CreateTaskUseCase(fakeTaskRepository);
  });

  it("deve atualizar o título da tarefa com sucesso", async () => {
    const task = await createTaskUseCase.execute({
      title: "Título original",
      category: "Trabalho",
      userId: "user-1",
    });

    const updated = await updateTaskUseCase.execute(task.id, "user-1", {
      title: "Título atualizado",
    });

    expect(updated.title).toBe("Título atualizado");
  });

  it("deve marcar tarefa como concluída", async () => {
    const task = await createTaskUseCase.execute({
      title: "Tarefa",
      category: "Pessoal",
      userId: "user-1",
    });

    const updated = await updateTaskUseCase.execute(task.id, "user-1", { completed: true });

    expect(updated.completed).toBe(true);
  });

  it("deve reabrir tarefa concluída", async () => {
    const task = await createTaskUseCase.execute({
      title: "Tarefa",
      category: "Pessoal",
      userId: "user-1",
    });

    await updateTaskUseCase.execute(task.id, "user-1", { completed: true });
    const reopened = await updateTaskUseCase.execute(task.id, "user-1", { completed: false });

    expect(reopened.completed).toBe(false);
  });

  it("deve atualizar a categoria da tarefa", async () => {
    const task = await createTaskUseCase.execute({
      title: "Tarefa",
      category: "Pessoal",
      userId: "user-1",
    });

    const updated = await updateTaskUseCase.execute(task.id, "user-1", { category: "Trabalho" });

    expect(updated.category).toBe("Trabalho");
  });

  it("deve atualizar o durationMinutes da tarefa", async () => {
    const task = await createTaskUseCase.execute({
      title: "Tarefa",
      category: "Estudos",
      userId: "user-1",
    });

    const updated = await updateTaskUseCase.execute(task.id, "user-1", { durationMinutes: 90 });

    expect(updated.durationMinutes).toBe(90);
  });

  it("deve lançar AppError 404 quando a tarefa não existe", async () => {
    await expect(
      updateTaskUseCase.execute("id-inexistente", "user-1", { title: "novo" })
    ).rejects.toMatchObject({ statusCode: 404, message: "Tarefa não encontrada" });
  });

  it("deve lançar AppError 403 quando o usuário não é dono da tarefa", async () => {
    const task = await createTaskUseCase.execute({
      title: "Tarefa do user-1",
      category: "Pessoal",
      userId: "user-1",
    });

    await expect(
      updateTaskUseCase.execute(task.id, "user-2", { title: "tentativa indevida" })
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("deve lançar AppError e não AppError genérico para 403", async () => {
    const task = await createTaskUseCase.execute({
      title: "Tarefa",
      category: "Pessoal",
      userId: "user-1",
    });

    const error = await updateTaskUseCase
      .execute(task.id, "user-2", { title: "x" })
      .catch((e) => e);

    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(403);
  });
});
