const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    console.log(' Middleware de autenticación');
    console.log('Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token no proporcionado'
      });
    }

    // Extraer token
    const token = authHeader.split(' ')[1];
    console.log('Token extraído:', token.substring(0, 30) + '...');

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token válido:', decoded);

    // Agregar usuario al request
    req.user = decoded;
    next();
  } catch (error) {
    console.error(' Error en authMiddleware:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

module.exports = authMiddleware;
