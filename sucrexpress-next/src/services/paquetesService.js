import apiClient from '@/lib/apiClient';

// Alias para mantener el mismo nombre interno que usaban las funciones
const api = apiClient;

export const paquetesService = {
  crear: async (datosPaquete) => {
    try {
      const response = await api.post('/paquetes', datosPaquete);
      return response.data;
    } catch (error) {
      console.error('Error al crear paquete:', error.response?.data || error.message);
      throw error;
    }
  },

  obtenerTodos: async () => {
    try {
      // Agregar timestamp para evitar caché
      const timestamp = Date.now();
      const response = await api.get(`/paquetes?t=${timestamp}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener paquetes:', error);
      throw error;
    }
  },

  obtenerPorId: async (id) => {
    try {
      const timestamp = Date.now();
      const response = await api.get(`/paquetes/${id}?t=${timestamp}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener paquete:', error);
      throw error;
    }
  },

  actualizar: async (id, datos) => {
    try {
      const response = await api.put(`/paquetes/${id}`, datos);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar paquete:', error);
      throw error;
    }
  },

  eliminar: async (id) => {
    try {
      const response = await api.delete(`/paquetes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar paquete:', error);
      throw error;
    }
  },

  asignar: async (id, datosAsignacion) => {
    try {
      const response = await api.put(`/paquetes/${id}/asignar`, datosAsignacion);
      return response.data;
    } catch (error) {
      console.error('Error al asignar paquete:', error);
      throw error;
    }
  },

  obtenerQR: async (id) => {
    try {
      const response = await api.get(`/paquetes/${id}/qr`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener QR del paquete:', error);
      throw error;
    }
  },

  aceptarPaquete: async (id, datos = {}) => {
    try {
      const response = await api.put(`/paquetes/${id}/aceptar`, datos);
      return response.data;
    } catch (error) {
      console.error('Error al aceptar paquete:', error);
      throw error;
    }
  },
};

export default paquetesService;
