import { CreateTaskUseCase, ListTasksUseCase } from "../../../modules/tasks/use-cases/taskUseCases";
import { FakeTaskRepository } from "../../fakes/FakeTaskRepository";

describe("ListTasksUseCase", () => {
  let fakeTaskRepository: FakeTaskRepository;
  let listTasksUseCase: ListTasksUseCase;
  let createTaskUseCase: CreateTaskUseCase;

  beforeEach(() => {
    fakeTaskRepository = new FakeTaskRepository();
    listTasksUseCase = new ListTasksUseCase(fakeTaskRepository);
    createTaskUseCase = new CreateTaskUseCase(fakeTaskRepository);
  });

  it("deve retornar lista vazia quando usuário não tem tarefas", async () => {
    const tasks = await listTasksUseCase.execute("user-1");
    expect(tasks).toHaveLength(0);
    expect(tasks).toEqual([]);
  });

  it("deve retornar apenas as tarefas do usuário logado", async () => {
    await createTaskUseCase.execute({ title: "Tarefa user-1 (A)", category: "Trabalho", userId: "user-1" });
    await createTaskUseCase.execute({ title: "Tarefa user-1 (B)", category: "Pessoal", userId: "user-1" });
    await createTaskUseCase.execute({ title: "Tarefa user-2",     category: "Estudos", userId: "user-2" });

    const tasks = await listTasksUseCase.execute("user-1");

    expect(tasks).toHaveLength(2);
    tasks.forEach((t) => expect(t.userId).toBe("user-1"));
  });

  it("não deve retornar tarefas de outros usuários", async () => {
    await createTaskUseCase.execute({ title: "Tarefa privada", category: "Pessoal", userId: "user-99" });

    const tasks = await listTasksUseCase.execute("user-1");
    expect(tasks).toHaveLength(0);
  });

  it("deve retornar todas as propriedades da tarefa", async () => {
    await createTaskUseCase.execute({
      title: "Tarefa completa",
      category: "Estudos",
      userId: "user-1",
      durationMinutes: 45,
    });

    const [task] = await listTasksUseCase.execute("user-1");

    expect(task).toHaveProperty("id");
    expect(task).toHaveProperty("title", "Tarefa completa");
    expect(task).toHaveProperty("category", "Estudos");
    expect(task).toHaveProperty("completed", false);
    expect(task).toHaveProperty("durationMinutes", 45);
    expect(task).toHaveProperty("userId", "user-1");
    expect(task).toHaveProperty("createdAt");
    expect(task).toHaveProperty("updatedAt");
  });
});
