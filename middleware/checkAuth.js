import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const checkAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = await Usuario.findById(decoded.id).select(
        '-password -token -confirmado -__v -createdAt -updatedAt'
      );
      return next();
    } catch (error) {
      return res.status(404).json({ Cuidado: 'Hubo un error' });
    }
  }
  if (!token) {
    const error = new Error('No autorizado');
    return res.status(401).json({ Cuidado: error.message });
  }

  next();
};

export default checkAuth;
