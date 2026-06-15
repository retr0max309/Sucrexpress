'use client';
import { useEffect } from 'react';
import { useNotificationsStore } from '../../store/notificationsStore';
import '../../assets/styles/notifications.css';

export default function NotificationsContainer() {
  const { notifications, removeNotification } = useNotificationsStore();

  return (
    <div className="notifications-container">
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          notification={notif}
          onClose={() => removeNotification(notif.id)}
        />
      ))}
    </div>
  );
}

function Notification({ notification, onClose }) {
  const {
    tipo,
    tipo_evento,
    titulo,
    mensaje,
    icono_fa,
    id,
    enlace_ruta
  } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const handleClick = () => {
    if (tipo === 'paquete') {
      localStorage.setItem('activeAdminSection', 'lista-paquetes');
      window.location.href = '/admin';
    } else if (tipo === 'incidencia') {
      localStorage.setItem('activeAdminSection', 'incidencias');
      window.location.href = '/admin';
    }
    onClose();
  };

  return (
    <div
      className={`notificacion notificacion-${tipo_evento}`}
      onClick={handleClick}
      role="alert"
    >
      <div className="notif-icono">
        <i className={icono_fa}></i>
      </div>
      <div className="notif-contenido">
        <h4 className="notif-titulo">{titulo}</h4>
        <p className="notif-mensaje">{mensaje}</p>
      </div>
      <button
        className="notif-cerrar"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar notificación"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}
