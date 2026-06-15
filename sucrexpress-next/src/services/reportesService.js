import apiClient from '@/lib/apiClient';

export const reportesService = {

  getReportePaquetes: async (periodo = 'mes') => {
    const response = await apiClient.get(`/reportes/paquetes?periodo=${periodo}`);
    return response.data;
  },

  getReporteIncidencias: async (periodo = 'mes') => {
    const response = await apiClient.get(`/reportes/incidencias?periodo=${periodo}`);
    return response.data;
  },
};
