import apiClient from '@/lib/apiClient';

export const sincronizacionesService = {

  getSincronizaciones: async (limite = 10) => {
    try {
      const response = await apiClient.get(`/sincronizaciones?limite=${limite}`);
      return response.data;
    } catch {
      return { success: false, data: [] };
    }
  },

  getCambiosDesde: async (timestamp) => {
    try {
      const desde = encodeURIComponent(timestamp);
      const response = await apiClient.get(`/sincronizaciones/cambios?desde=${desde}`);
      return response.data;
    } catch {
      // Error silencioso durante reinicios del servidor en desarrollo
      return { success: false, hay_cambios: false, data: [] };
    }
  },
};
