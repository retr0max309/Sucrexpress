'use client';
import { useState } from 'react';
import html2canvas from 'html2canvas';

const QRDisplay = ({ qrCode, numeroGuia, size = 'medium' }) => {
  const [downloading, setDownloading] = useState(false);

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'qr-display-small';
      case 'large':
        return 'qr-display-large';
      case 'medium':
      default:
        return 'qr-display-medium';
    }
  };

  const downloadQR = async () => {
    if (!qrCode) return;
    
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `QR_${numeroGuia || 'paquete'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error descargando QR:', error);
    } finally {
      setDownloading(false);
    }
  };

  const printQR = async () => {
    if (!qrCode) return;

    try {
      const printWindow = window.open('', '', 'height=600,width=600');
      printWindow.document.write(`
        <html>
          <head>
            <title>QR - ${numeroGuia || 'Paquete'}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
              }
              .print-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
              }
              img {
                max-width: 400px;
                border: 2px solid #333;
                padding: 10px;
              }
              h2 {
                margin: 0;
                color: #333;
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <h2>Código QR del Paquete</h2>
              <h3>${numeroGuia || 'N/A'}</h3>
              <img src="${qrCode}" alt="QR Code" />
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error('Error imprimiendo QR:', error);
    }
  };

  if (!qrCode) {
    return (
      <div className={`qr-display ${getSizeClass()}`}>
        <div className="qr-empty">
          <p>QR no disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`qr-display ${getSizeClass()}`}>
      <img src={qrCode} alt={`QR ${numeroGuia}`} className="qr-image" />
      <div className="qr-actions">
        <button
          className="qr-btn qr-btn-download"
          onClick={downloadQR}
          disabled={downloading}
          title="Descargar QR"
        >
          {downloading ? 'Descargando...' : '↓ Descargar'}
        </button>
        <button
          className="qr-btn qr-btn-print"
          onClick={printQR}
          title="Imprimir QR"
        >
          Imprimir
        </button>
      </div>
    </div>
  );
};

export default QRDisplay;
