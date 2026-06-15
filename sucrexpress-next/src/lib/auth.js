import jwt from 'jsonwebtoken';

export function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, status: 401, message: 'No autorizado - Token no proporcionado' };
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { success: true, user: decoded };
  } catch (error) {
    return { success: false, status: 401, message: 'Token inválido o expirado' };
  }
}
