import express from 'express';
import checkAuth from '../middleware/checkAuth.js';
import {
  agregarTarea,
  obtenerTarea,
  editarTarea,
  eliminarTarea,
  cambiarEstadoTarea,
} from '../controllers/tareaController.js';

const router = express.Router();

router.post('/', checkAuth, agregarTarea);
router
  .route('/:id')
  .get(checkAuth, obtenerTarea)
  .put(checkAuth, editarTarea)
  .delete(checkAuth, eliminarTarea);

router.post('/estado/:id', checkAuth, cambiarEstadoTarea);

export default router;