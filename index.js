import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';

const app = express();
app.use(express.json());

dotenv.config();
connectDB();

// Cors
const whiteList = [process.env.FRONTEND_URL];
const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

// Routing
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Soclet.io
import { Server } from 'socket.io';

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: [process.env.FRONTEND_URL],
  },
});

io.on('connection', (socket) => {
  //console.log('New client connected');

  // Definir los eventos de socket IO
  socket.on('obtener-proyecto', (proyecto) => {
    socket.join(proyecto);
  });
  socket.on('nueva-tarea', (tarea) => {
    socket.to(tarea.proyecto).emit('tarea-agregada', tarea);
  });
  socket.on('eliminar-tarea', (tarea) => {
    socket.to(tarea.proyecto).emit('tarea-eliminada', tarea);
  });
  socket.on('editar-tarea', (tarea) => {
    socket.to(tarea.proyecto).emit('tarea-actualizada', tarea);
  });
  socket.on('cambiar-estado', (tarea) => {
    socket.to(tarea.proyecto._id).emit('nuevo-estado', tarea);
  });
});
