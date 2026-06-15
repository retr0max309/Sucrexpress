// importo la conexion a supabase
const { getConnection } = require('../config/database');
// importo bcrypt para comparar y hashear contrasenas
const bcrypt = require('bcryptjs');

// clase usuario para manejar usuarios del sistema
class User {
  constructor(data) {
    // guardo los datos del usuario
    this.codigo_us = data.codigo_us;
    this.Usuario = data.usuario;
    this.Contraseña = data.Contraseña; // con ñ y mayuscula
    this.email = data.email;
    this.codigo_tu = data.codigo_tu;
    this.estado = data.estado;
  }

  // busca usuario por email para login
  static async findByEmail(email) {
    try {
      const { admin } = await getConnection();
      
      // consulta equivalente a tu query SQL
      const { data, error } = await admin
        .from('tb_usuarios')
        .select('codigo_us, usuario, "Contraseña", email, codigo_tu, estado')
        .eq('email', email)
        .eq('estado', true)
        .single(); // equivalente a obtener un solo registro
      
      if (error) {
        if (error.code === 'PGRST116') {
          // no se encontro usuario
          return null;
        }
        throw error;
      }
      
      if (data) {
        return new User(data);
      }
      
      return null;
    } catch (error) {
      console.error('error en findByEmail:', error);
      throw error;
    }
  }

  // verifica la contrasena del usuario
  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.Contraseña);
    } catch (error) {
      console.error('error al verificar contrasena:', error);
      throw error;
    }
  }

  // crea un nuevo usuario en la base de datos
  static async create(userData) {
    try {
      const { admin } = await getConnection();
      
      // hasheo la contrasena antes de guardar
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // inserto el nuevo usuario
      const { data, error } = await admin
        .from('tb_usuarios')
        .insert([
          {
            usuario: userData.usuario,
            "Contraseña": hashedPassword,
            email: userData.email,
            codigo_tu: userData.codigo_tu || 1, // por defecto cliente
            estado: true
          }
        ])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return new User(data);
    } catch (error) {
      console.error('error al crear usuario:', error);
      throw error;
    }
  }

  // busca usuario por codigo_us
  static async findById(codigo_us) {
    try {
      const { admin } = await getConnection();
      
      const { data, error } = await admin
        .from('tb_usuarios')
        .select('codigo_us, usuario, "Contraseña", email, codigo_tu, estado')
        .eq('codigo_us', codigo_us)
        .eq('estado', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      
      if (data) {
        return new User(data);
      }
      
      return null;
    } catch (error) {
      console.error('error en findById:', error);
      throw error;
    }
  }
}

module.exports = User;
