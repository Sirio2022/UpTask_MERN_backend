import Proyecto from '../models/Proyecto.js';
import Tarea from '../models/Tarea.js';

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;

  const existeProyecto = await Proyecto.findById(proyecto);

  if (!existeProyecto) {
    const error = new Error('El proyecto no existe');
    return res.status(404).json({ msg: error.message });
  }

  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      'No tienes los permisos para realizar esta acción, añadir una tarea'
    );
    return res.status(404).json({ msg: error.message });
  }

  try {
    const tarea = await Tarea.create(req.body);
    // Almacenar el proyecto al que pertenece la tarea.  Su Id.
    existeProyecto.tareas.push(tarea._id);
    await existeProyecto.save();
    res.status(201).json(tarea);
  } catch (error) {
    console.log(error);
  }
};

const obtenerTarea = async (req, res) => {
  const { id } = req.params;

  const existeTarea = await Tarea.findById(id).populate('proyecto');

  if (!existeTarea) {
    const error = new Error('La tarea no existe');
    return res.status(404).json({ msg: error.message });
  }

  if (existeTarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      'No tienes los permisos para realizar esta acción, obtener una tarea'
    );
    return res.status(403).json({ msg: error.message });
  }

  try {
    res.status(200).json(existeTarea);
  } catch (error) {
    console.log(error);
  }
};

const editarTarea = async (req, res) => {
  const { id } = req.params;

  const existeTarea = await Tarea.findById(id).populate('proyecto');

  if (!existeTarea) {
    const error = new Error('La tarea no existe');
    return res.status(404).json({ msg: error.message });
  }

  if (existeTarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      'No tienes los permisos para realizar esta acción, editar esta tarea'
    );
    return res.status(403).json({ msg: error.message });
  }

  const tareaActualizada = await Tarea.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  res.status(200).json(tareaActualizada);
};

const eliminarTarea = async (req, res) => {
  const { id } = req.params;

  const existeTarea = await Tarea.findById(id).populate('proyecto');

  if (!existeTarea) {
    const error = new Error('La tarea no existe');
    return res.status(404).json({ msg: error.message });
  }

  if (existeTarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      'No tienes los permisos para realizar esta acción, obtener una tarea'
    );
    return res.status(403).json({ msg: error.message });
  }

  try {
    const proyecto = await Proyecto.findById(existeTarea.proyecto);
    proyecto.tareas.pull(existeTarea._id);

    await Promise.allSettled([
      await proyecto.save(),
      await Tarea.findByIdAndDelete(id),
    ]);
    res.status(200).json({ msg: 'Tarea eliminada con éxito' });
  } catch (error) {
    console.log(error);
  }
};

const cambiarEstadoTarea = async (req, res) => {
  const { id } = req.params;

  const existeTarea = await Tarea.findById(id).populate('proyecto');

  if (!existeTarea) {
    const error = new Error('La tarea no existe');
    return res.status(404).json({ msg: error.message });
  }

  if (
    existeTarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !existeTarea.proyecto.colaboradores.some(
      (colaborador) => colaborador.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error(
      'No tienes los permisos para realizar esta acción, obtener una tarea'
    );
    return res.status(403).json({ msg: error.message });
  }
  existeTarea.estado = !existeTarea.estado;
  existeTarea.completado = req.usuario._id;
  await existeTarea.save();

const tareaAlmacenada = await Tarea.findById(id).populate('proyecto').populate('completado');

  res.status(200).json(tareaAlmacenada);
};

export {
  agregarTarea,
  obtenerTarea,
  editarTarea,
  eliminarTarea,
  cambiarEstadoTarea,
};
