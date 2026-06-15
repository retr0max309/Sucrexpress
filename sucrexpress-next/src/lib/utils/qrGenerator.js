const QRCode = require('qrcode');

const generateQRCode = async (paqueteData) => {
  try {
    const qrData = {
      paquete_id: paqueteData.id,
      numero_guia: paqueteData.numero_guia,
      nombre_destinatario: paqueteData.nombre_destinatario,
      apellido_destinatario: paqueteData.apellido_destinatario,
      ciudad_destino: paqueteData.ciudad_destino,
      direccion_exacta: paqueteData.direccion_exacta,
      numero_casa: paqueteData.numero_casa,
    };

    const qrJson = JSON.stringify(qrData);
    const qrImage = await QRCode.toDataURL(qrJson, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
    });

    return qrImage;
  } catch (error) {
    throw new Error(`Error generating QR code: ${error.message}`);
  }
};

module.exports = { generateQRCode };
