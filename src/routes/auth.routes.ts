import { Router } from "express";
import { AuthController } from "../modules/auth/controllers/AuthController";
import { ensureAuthenticated } from "../shared/middlewares/ensureAuthenticated";

const authRoutes = Router();
const authController = new AuthController();

// Public routes
authRoutes.post("/register", (req, res, next) => {
  authController.register(req, res).catch(next);
});

authRoutes.post("/login", (req, res, next) => {
  authController.login(req, res).catch(next);
});

// Protected route
authRoutes.get("/me", ensureAuthenticated, (req, res, next) => {
  authController.me(req, res).catch(next);
});

export { authRoutes };
