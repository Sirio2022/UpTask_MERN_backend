import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const usuarioSchema = mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    token: {
      type: String,
    },
    confirmado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

usuarioSchema.pre('save', async function (next) {
  //Antes de guardar el usuario, se ejecuta esta función
  if (!this.isModified('password')) {
    next(); //Si el password no ha sido modificado, no se ejecuta nada
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
