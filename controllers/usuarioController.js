import Usuario from '../models/Usuario.js';
import generarId from '../helpers/generarId.js';
import generarJWT from '../helpers/generarJWT.js';
import { emailRegistro, emailOlvidePassword } from '../helpers/email.js';

const registrar = async (req, res) => {
  //Evitar que se registren usuarios con el mismo email
  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({ email });
  if (existeUsuario) {
    const error = new Error('El usuario ya existe con ese Email');
    return res.status(400).json({ msg: error.message });
  }

  try {
    const usuario = new Usuario(req.body);
    usuario.token = generarId(); //Generar un token para el usuario. Este token se enviará por email para confirmar la cuenta.
    await usuario.save();
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    }); //Enviar email de confirmación de cuenta
    res.json({
      msg: 'Usuario registrado correctamente, revisa tu Email para confirmar tu cuenta.',
    });
  } catch (error) {
    console.log(error);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;

  //Comprobar si el usuario existe

  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error('El usuario no existe');
    return res.status(404).json({ msg: error.message });
  }

  //Comprobar que el usuario está confirmado
  if (!usuario.confirmado) {
    const error = new Error('Tu cuenta no ha sido confirmada');
    return res.status(403).json({ msg: error.message });
  }

  //Comprobar que el password es correcto

  if (await usuario.matchPassword(password)) {
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    });
  } else {
    const error = new Error('El password es incorrecto');
    return res.status(401).json({ msg: error.message });
  }
};

const confirmarCuenta = async (req, res) => {
  const { token } = req.params;
  const usuarioConfirmar = await Usuario.findOne({ token });
  if (!usuarioConfirmar) {
    const error = new Error('Token no válido');
    return res.status(403).json({ msg: error.message });
  }

  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = '';
    await usuarioConfirmar.save();
    res.json({
      msg: 'Cuenta confirmada existosamente, ya puedes iniciar sesión.',
    });
  } catch (error) {
    console.log(error);
  }
};

const olvidePassword = async (req, res) => {
  const { email } = req.body;

  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error('El usuario no existe');
    return res.status(404).json({ msg: error.message });
  }

  try {
    usuario.token = generarId();
    await usuario.save();
    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    }); //Enviar email para restablecer password
    res.json({
      msg: 'Te hemos enviado un email para restablecer tu password',
    });
  } catch (error) {
    console.log(error);
  }
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const tokenValido = await Usuario.findOne({ token });

  if (tokenValido) {
    res.json({ msg: 'Token válido, el usuario existe' });
  } else {
    const error = new Error('Token no válido');
    return res.status(404).json({ msg: error.message });
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const usuario = await Usuario.findOne({ token });

  if (usuario) {
    usuario.password = password;
    usuario.token = '';
    try {
      await usuario.save();
      res.json({ msg: 'Password actualizado' });
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error('Token no válido');
    return res.status(404).json({ msg: error.message });
  }
};

const perfil = async (req, res) => {
  const { usuario } = req;
  res.json(usuario);
};

export {
  registrar,
  autenticar,
  confirmarCuenta,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};
