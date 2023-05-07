import nodemailer from 'nodemailer';

export const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transport.sendMail({
    from: '"UpTask - MERN" <cuentas@uptask.com>',
    to: email,
    subject: 'Confirma tu cuenta',
    text: 'Confirma tu cuenta enUpTask',
    html: `
                <h1>Confirma tu cuenta</h1>
                <p>Hola: ${nombre}</p>
                <p>Para confirmar tu cuenta haz click en el siguiente enlace</p>
                <a href="${process.env.FRONTEND_URL}/confirmar-cuenta/${token}">Confirmar cuenta</a>


            
            `,
  });
};

export const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const info = await transport.sendMail({
    from: '"UpTask - MERN" <cuentas@uptask.com>',
    to: email,
    subject: 'UpTask - MERN Reestablece tu password',
    text: 'Reestablece tu password en UpTask',
    html: `
                <h1>Reestablece tu password</h1>
                <p>Hola: ${nombre}</p>
                <p>Para reestablecer tu password haz click en el siguiente enlace</p>
                <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>


            
            `,
  });
};
