'use client';
import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    const statusMap = {
      'En almacén': 'status-almacen',
      'En tránsito': 'status-transito',
      'Entregado': 'status-entregado',
      'Fallido': 'status-fallido',
      'Asignado': 'status-asignado'
    };
    return statusMap[status] || 'status-default';
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
