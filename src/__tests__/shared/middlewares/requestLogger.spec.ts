import { Request, Response, NextFunction } from "express";
import { EventEmitter } from "events";

jest.mock("../../../shared/observability/metrics", () => ({
  httpRequestsTotal: { inc: jest.fn() },
  httpRequestDuration: { observe: jest.fn() },
  httpRequestsInFlight: { inc: jest.fn(), dec: jest.fn() },
}));

jest.mock("../../../shared/observability/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { requestLogger } from "../../../shared/middlewares/requestLogger";
import { logger } from "../../../shared/observability/logger";

function makeMocks(statusCode: number, hasRoute = true) {
  const res = Object.assign(new EventEmitter(), {
    statusCode,
  }) as unknown as Response;

  const req = {
    method: "GET",
    originalUrl: "/test",
    path: "/test",
    ip: "127.0.0.1",
    headers: { "user-agent": "jest-test" },
    route: hasRoute ? { path: "/test" } : undefined,
    baseUrl: "",
  } as unknown as Request;

  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe("requestLogger middleware", () => {
  it("deve chamar next() e atribuir requestId e startTime", () => {
    const { req, res, next } = makeMocks(200);

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.requestId).toBeDefined();
    expect(req.startTime).toBeDefined();
  });

  it("deve registrar log nível info para respostas 2xx", () => {
    const { req, res, next } = makeMocks(200);
    requestLogger(req, res, next);

    res.emit("finish");

    expect((logger as jest.Mocked<typeof logger>).info).toHaveBeenCalledWith(
      "HTTP request",
      expect.objectContaining({ statusCode: 200 })
    );
  });

  it("deve registrar log nível warn para respostas 4xx", () => {
    const { req, res, next } = makeMocks(401);
    requestLogger(req, res, next);

    res.emit("finish");

    expect((logger as jest.Mocked<typeof logger>).warn).toHaveBeenCalledWith(
      "HTTP request",
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it("deve registrar log nível error para respostas 5xx", () => {
    const { req, res, next } = makeMocks(500);
    requestLogger(req, res, next);

    res.emit("finish");

    expect((logger as jest.Mocked<typeof logger>).error).toHaveBeenCalledWith(
      "HTTP request",
      expect.objectContaining({ statusCode: 500 })
    );
  });

  it("deve usar req.path como rota quando req.route é undefined (404)", () => {
    const { req, res, next } = makeMocks(404, false);
    requestLogger(req, res, next);

    res.emit("finish");

    expect((logger as jest.Mocked<typeof logger>).warn).toHaveBeenCalledWith(
      "HTTP request",
      expect.objectContaining({ route: "/test" })
    );
  });

  it("deve usar string vazia quando req.baseUrl é undefined", () => {
    const { req, res, next } = makeMocks(200);
    (req as any).baseUrl = undefined;
    requestLogger(req, res, next);

    res.emit("finish");

    expect((logger as jest.Mocked<typeof logger>).info).toHaveBeenCalledWith(
      "HTTP request",
      expect.objectContaining({ statusCode: 200 })
    );
  });
});
