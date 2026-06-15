import { useNotificationsStore } from '../store/notificationsStore';

export const notificationHelper = {
  paqueteEntregado: (numero_guia, destinatario, ciudad, id) => {
    const { addNotification } = useNotificationsStore.getState();
    addNotification({
      tipo: 'paquete',
      tipo_evento: 'entregado',
      titulo: 'Paquete Entregado',
      mensaje: `${numero_guia} - ${destinatario}, ${ciudad}`,
      icono_fa: 'fas fa-check-circle',
      enlace_ruta: `/admin/paquetes/${id}`
    });
  },

  paqueteEnRuta: (numero_guia, destinatario, ciudad, id) => {
    const { addNotification } = useNotificationsStore.getState();
    addNotification({
      tipo: 'paquete',
      tipo_evento: 'en_ruta',
      titulo: 'Paquete en Ruta',
      mensaje: `${numero_guia} - ${destinatario}, ${ciudad}`,
      icono_fa: 'fas fa-truck',
      enlace_ruta: `/admin/paquetes/${id}`
    });
  },

  paqueteDevuelto: (numero_guia, destinatario, ciudad, id) => {
    const { addNotification } = useNotificationsStore.getState();
    addNotification({
      tipo: 'paquete',
      tipo_evento: 'devuelto',
      titulo: 'Paquete Devuelto',
      mensaje: `${numero_guia} - ${destinatario}, ${ciudad}`,
      icono_fa: 'fas fa-undo',
      enlace_ruta: `/admin/paquetes/${id}`
    });
  },

  incidenciaReportada: (numero_guia, repartidor, tipo_incidencia, id) => {
    const { addNotification } = useNotificationsStore.getState();
    addNotification({
      tipo: 'incidencia',
      tipo_evento: 'reportada',
      titulo: 'Incidencia Reportada',
      mensaje: `${numero_guia} - ${repartidor}`,
      icono_fa: 'fas fa-exclamation-triangle',
      enlace_ruta: `/admin/incidencias/${id}`
    });
  },

  incidenciaRespondida: (numero_guia, repartidor, id) => {
    const { addNotification } = useNotificationsStore.getState();
    addNotification({
      tipo: 'incidencia',
      tipo_evento: 'respondida',
      titulo: 'Incidencia Respondida',
      mensaje: `${numero_guia} - ${repartidor}`,
      icono_fa: 'fas fa-check',
      enlace_ruta: `/admin/incidencias/${id}`
    });
  },

  incidenciaResuelta: (numero_guia, repartidor, id) => {
    const { addNotification } = useNotificationsStore.getState();
    addNotification({
      tipo: 'incidencia',
      tipo_evento: 'resuelta',
      titulo: 'Incidencia Resuelta',
      mensaje: `${numero_guia} - ${repartidor}`,
      icono_fa: 'fas fa-check-circle',
      enlace_ruta: `/admin/incidencias/${id}`
    });
  },

  error: (titulo, mensaje) => {
    const { addNotification } = useNotificationsStore.getState();
    addNotification({
      tipo: 'error',
      tipo_evento: 'error',
      titulo: `Error: ${titulo}`,
      mensaje: mensaje,
      icono_fa: 'fas fa-exclamation-circle'
    });
  },

  exito: (titulo, mensaje) => {
    const { addNotification } = useNotificationsStore.getState();
    addNotification({
      tipo: 'exito',
      tipo_evento: 'entregado',
      titulo: titulo,
      mensaje: mensaje,
      icono_fa: 'fas fa-check-circle'
    });
  }
};
