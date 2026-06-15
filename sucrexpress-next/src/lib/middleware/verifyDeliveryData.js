// importo la conexion y sql para usar la base de datos
const { getConnection, sql } = require('../config/database');
const jwt = require('jsonwebtoken');

// middleware para verificar que el usuario tiene datos de entrega registrados
const verifyDeliveryData = async (req, res, next) => {
  try {
    // reviso si el usuario esta autenticado
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'token de autenticacion requerido',
        requiresAuth: true
      });
    }

    // decodifico el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sucrexpress_secret_key');
    
    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'token invalido',
        requiresAuth: true
      });
    }

    // reviso si el usuario tiene datos de entrega
    const pool = await getConnection();
    const request = pool.request();
    
    request.input('codigo_us', sql.Int, decoded.userId);
    
    const result = await request.query(`
      select 
        codigo_datos,
        nombres,
        apellidos,
        email_personal,
        celular,
        direccion_principal
      from tb_datos_entrega 
      where codigo_us = @codigo_us and estado = 1
    `);

    if (result.recordset.length === 0) {
      // si no tiene datos de entrega no lo dejo pasar
      return res.status(403).json({
        success: false,
        message: 'debes registrar tus datos de entrega antes de acceder al catalogo',
        requiresDeliveryData: true,
        action: 'register_delivery_data'
      });
    }

    // si todo bien, agrego los datos al request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      deliveryData: result.recordset[0]
    };

    console.log(`usuario ${decoded.username} accediendo al catalogo con datos de entrega registrados`);
    
    next();

  } catch (error) {
    // manejo errores de jwt y otros
    console.error('error en middleware de verificacion de datos de entrega:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'token invalido',
        requiresAuth: true
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'token expirado',
        requiresAuth: true
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'error interno del servidor'
    });
  }
};

// exporto el middleware
module.exports = verifyDeliveryData;