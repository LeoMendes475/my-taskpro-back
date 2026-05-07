import { CreateTaskUseCase } from "../../../modules/tasks/use-cases/taskUseCases";
import { FakeTaskRepository } from "../../fakes/FakeTaskRepository";

describe("CreateTaskUseCase", () => {
  let fakeTaskRepository: FakeTaskRepository;
  let createTaskUseCase: CreateTaskUseCase;

  beforeEach(() => {
    fakeTaskRepository = new FakeTaskRepository();
    createTaskUseCase = new CreateTaskUseCase(fakeTaskRepository);
  });

  it("deve criar uma tarefa com sucesso", async () => {
    const task = await createTaskUseCase.execute({
      title: "Estudar Clean Architecture",
      category: "Estudos",
      userId: "user-1",
    });

    expect(task).toMatchObject({
      title: "Estudar Clean Architecture",
      category: "Estudos",
      userId: "user-1",
      completed: false,
    });
    expect(task.id).toBeDefined();
  });

  it("deve criar tarefa com durationMinutes quando informado", async () => {
    const task = await createTaskUseCase.execute({
      title: "Reunião",
      category: "Trabalho",
      userId: "user-1",
      durationMinutes: 60,
    });

    expect(task.durationMinutes).toBe(60);
  });

  it("deve criar tarefa sem durationMinutes quando não informado", async () => {
    const task = await createTaskUseCase.execute({
      title: "Tarefa simples",
      category: "Pessoal",
      userId: "user-1",
    });

    expect(task.durationMinutes).toBeNull();
  });

  it("deve criar tarefa com completed = false por padrão", async () => {
    const task = await createTaskUseCase.execute({
      title: "Nova tarefa",
      category: "Trabalho",
      userId: "user-1",
    });

    expect(task.completed).toBe(false);
  });

  it("deve associar a tarefa ao userId correto", async () => {
    const task = await createTaskUseCase.execute({
      title: "Minha tarefa",
      category: "Pessoal",
      userId: "user-42",
    });

    expect(task.userId).toBe("user-42");
  });
});
