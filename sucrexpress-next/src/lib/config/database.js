const { createClient } = require('@supabase/supabase-js');
// cargo las variables de entorno (Next.js las carga automáticamente)

// configuro las credenciales de supabase
const supabaseConfig = {
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceKey: process.env.SUPABASE_SERVICE_KEY
};

// variable para guardar la instancia de supabase
let supabaseClient;
let supabaseAdmin;

// funcion para conectar a supabase
const connectToDatabase = async () => {
  try {
    // si ya hay conexion la uso
    if (supabaseClient && supabaseAdmin) {
      return { client: supabaseClient, admin: supabaseAdmin };
    }

    console.log('conectando a supabase...');
    console.log(`proyecto: ${supabaseConfig.url}`);
    
    // validaciones de variables de entorno
    if (!supabaseConfig.url) {
      throw new Error('error: supabase_url no esta definida en .env');
    }
    if (!supabaseConfig.anonKey) {
      throw new Error('error: supabase_anon_key no esta definida en .env');
    }
    if (!supabaseConfig.serviceKey) {
      throw new Error('error: supabase_service_key no esta definida en .env');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('error: jwt_secret no esta definida en .env');
    }

    // creo cliente normal (con RLS)
    supabaseClient = createClient(
      supabaseConfig.url,
      supabaseConfig.anonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    // creo cliente admin (sin RLS - equivalente a tu conexion SQL directa)
    supabaseAdmin = createClient(
      supabaseConfig.url,
      supabaseConfig.serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    console.log('conexion a supabase establecida exitosamente');

    return { client: supabaseClient, admin: supabaseAdmin };
  } catch (error) {
    console.error('error al conectar con supabase:', error.message);
    console.error('verifica que:');
    console.error('   - las credenciales en .env sean correctas');
    console.error('   - supabase_url tenga el formato: https://xxx.supabase.co');
    console.error('   - las api keys sean validas');
    console.error('   - el proyecto de supabase este activo');
    
    supabaseClient = null;
    supabaseAdmin = null;
    throw error;
  }
};

// funcion para obtener la conexion
const getConnection = async () => {
  try {
    if (!supabaseClient || !supabaseAdmin) {
      console.log('instancia no existe, creando conexion...');
      await connectToDatabase();
    }
    
    return { admin: supabaseAdmin, client: supabaseClient };
  } catch (error) {
    console.error('error al obtener conexion:', error);
    supabaseClient = null;
    supabaseAdmin = null;
    throw error;
  }
};

// funcion para cerrar la conexion
const closeConnection = async () => {
  try {
    console.log('limpiando referencias de supabase...');
    supabaseClient = null;
    supabaseAdmin = null;
    console.log('referencias limpiadas correctamente');
  } catch (error) {
    console.error('error al limpiar referencias:', error);
  }
};

// funcion para probar la conexion
const testConnection = async () => {
  try {
    console.log('probando conexion a supabase...');
    const { admin } = await getConnection();
    
    // pruebo con una consulta simple
    const { data, error } = await admin
      .from('tb_tipo_usuario')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('error en consulta de prueba:', error);
      return false;
    }
    
    console.log('test de conexion exitoso:', {
      status: 'conexion exitosa',
      url: supabaseConfig.url,
      test_query: 'ok'
    });
    
    return true;
  } catch (error) {
    console.error('test de conexion fallo:', error.message);
    return false;
  }
};

// exporto las funciones
module.exports = {
  connectToDatabase,
  getConnection,
  closeConnection,
  testConnection
};
