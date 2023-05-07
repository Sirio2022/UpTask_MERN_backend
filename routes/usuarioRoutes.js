import express from 'express';
const router = express.Router();
import {
  registrar,
  autenticar,
  confirmarCuenta,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
} from '../controllers/usuarioController.js';
import checkAuth from '../middleware/checkAuth.js';

// Autenticación, Registro y Confirmación de Usuarios
router.post('/', registrar); //Crear un nuevo usuario
router.post('/login', autenticar); //Iniciar sesión
router.get('/confirmar/:token', confirmarCuenta); //Confirmar cuenta (email). Se envía un token por email y es de una sola vez.
router.post('/olvide-password', olvidePassword); //Olvidé mi password. Se envía un token por email y es de una sola vez.
router.route('/olvide-password/:token').post(nuevoPassword).get(comprobarToken); //Se envía un token por email y es de una sola vez.

router.use('/perfil', checkAuth, perfil); //Middleware para proteger las rutas de abajo

export default router;
