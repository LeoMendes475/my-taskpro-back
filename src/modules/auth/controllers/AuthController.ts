import { Request, Response } from 'express';
import { loginSchema, registerSchema } from '../dtos/authDTOs';
import { UserRepository } from '../repositories/UserRepository';
import { LoginUseCase } from '../use-cases/LoginUseCase';
import { RegisterUseCase } from '../use-cases/RegisterUseCase';

export class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    const body = registerSchema.parse(req.body);

    const userRepository = new UserRepository();
    const registerUseCase = new RegisterUseCase(userRepository);

    const user = await registerUseCase.execute(body);

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      user,
    });
  }

  async login(req: Request, res: Response): Promise<Response> {
    const body = loginSchema.parse(req.body);

    const userRepository = new UserRepository();
    const loginUseCase = new LoginUseCase(userRepository);

    const result = await loginUseCase.execute(body);

    return res.status(200).json(result);
  }

  async me(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({ user: req.user });
  }
}
