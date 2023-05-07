const generarId = () => {
  const random =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const fecha = Date.now().toString(36);
  return random + fecha;
};

export default generarId;
