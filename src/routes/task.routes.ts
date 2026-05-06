import { Router } from 'express';
import { TaskController } from '../modules/tasks/controllers/TaskController';
import { ensureAuthenticated } from '../shared/middlewares/ensureAuthenticated';

const taskRoutes = Router();
const taskController = new TaskController();

// All task routes are protected
taskRoutes.use(ensureAuthenticated);

taskRoutes.post('/', (req, res, next) => {
  taskController.create(req, res).catch(next);
});

taskRoutes.get('/', (req, res, next) => {
  taskController.list(req, res).catch(next);
});

taskRoutes.put('/:id', (req, res, next) => {
  taskController.update(req, res).catch(next);
});

taskRoutes.delete('/:id', (req, res, next) => {
  taskController.delete(req, res).catch(next);
});

export { taskRoutes };
