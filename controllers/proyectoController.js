import Proyecto from '../models/Proyecto.js';
import Usuario from '../models/Usuario.js';

const obtenerProyectos = async (req, res) => {
  const proyectos = await Proyecto.find({
    $or: [
      { creador: { $in: req.usuario } },
      { colaboradores: { $in: req.usuario } },
    ],
  }).select('-tareas');
  res.status(200).json(proyectos);
};

const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;
  try {
    const proyectoAlmacenado = await proyecto.save();
    res.status(201).json(proyectoAlmacenado);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

const obtenerProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id)
    .populate({
      path: 'tareas',
      populate: { path: 'completado', select: 'nombre' },
    })
    .populate('colaboradores', 'nombre email');

  if (!proyecto) {
    const error = new Error('El proyecto no existe');
    return res.status(404).json({ msg: error.message });
  }
  if (
    proyecto.creador.toString() !== req.usuario._id.toString() &&
    !proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error('No tienes los persmisos para ver este proyecto');
    return res.status(404).json({ msg: error.message });
  }

  res.status(200).json(proyecto);
};

const editarProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error('El proyecto no existe');
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('No estás autorizado para ver este proyecto!');
    return res.status(401).json({ msg: error.message });
  }

  const proyectoActualizado = await Proyecto.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  res.status(200).json(proyectoActualizado);
};

const eliminarProyecto = async (req, res) => {
  const { id } = req.params;

  const proyecto = await Proyecto.findById(id);

  if (!proyecto) {
    const error = new Error('El proyecto no existe');
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('No estás autorizado para ver este proyecto!');
    return res.status(401).json({ msg: error.message });
  }

  await Proyecto.findByIdAndDelete(id);

  res.status(200).json({ msg: 'Proyecto eliminado correctamente' });
};

const buscarColaborador = async (req, res) => {
  const { email } = req.body;

  const usuario = await Usuario.findOne({ email }).select(
    '-password -__v -createdAt -updatedAt -confirmado -token'
  );

  if (!usuario) {
    const error = new Error('El usuario no existe');
    return res.status(404).json({ msg: error.message });
  }

  res.status(200).json(usuario);
};

const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error('El proyecto no existe');
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('No estás autorizado para ver este proyecto!');
    return res.status(401).json({ msg: error.message });
  }

  const { email } = req.body;

  const usuario = await Usuario.findOne({ email }).select(
    '-password -__v -createdAt -updatedAt -confirmado -token'
  );

  if (!usuario) {
    const error = new Error('El usuario no existe');
    return res.status(404).json({ msg: error.message });
  }

  // Comprobar que el usuario no esté ya en el proyecto
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error('El usuario es Admin y no puede ser colaborador');
    return res.status(400).json({ msg: error.message });
  }

  // Comprobar que el usuario no esté ya en el proyecto
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error('El usuario ya está en el proyecto');
    return res.status(400).json({ msg: error.message });
  }

  // Agregar el usuario al proyecto
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();

  res.status(200).json({ msg: 'Colaborador agregado correctamente' });
};

const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error('El proyecto no existe');
    return res.status(404).json({ msg: error.message });
  }
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error('No estás autorizado para ver este proyecto!');
    return res.status(401).json({ msg: error.message });
  }

  // Eliminar el usuario al proyecto
  proyecto.colaboradores.pull(req.body.id);

  await proyecto.save();

  res.status(200).json({ msg: 'Colaborador eliminado correctamente' });
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
};
