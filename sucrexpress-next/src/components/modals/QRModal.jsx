'use client';
import { useState } from 'react';
import QRDisplay from '../admin/QRDisplay';

const QRModal = ({ isOpen, qrCode, numeroGuia, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <h2>Código QR del Paquete</h2>
          <button className="qr-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="qr-modal-body">
          <div className="qr-modal-info">
            <p><strong>Número de Guía:</strong> {numeroGuia}</p>
          </div>
          <QRDisplay qrCode={qrCode} numeroGuia={numeroGuia} size="large" />
        </div>
      </div>
    </div>
  );
};

export default QRModal;
