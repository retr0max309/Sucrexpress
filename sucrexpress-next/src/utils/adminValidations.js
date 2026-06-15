

const PATTERNS = {
  // Solo letras, espacios y acentos
  NOMBRE: /^[a-záéíóúñ\s'-]{2,100}$/i,
  
  // Letras, números, espacios, guiones, puntos
  DIRECCION: /^[a-záéíóúñ0-9\s.,#-]{5,200}$/i,
  
  // Email válido
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Teléfono: 7-15 dígitos, puede tener +, -, espacios, paréntesis
  TELEFONO: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  
  // CI/DNI: números y puede tener guion
  CI: /^[0-9]{4,20}(-[0-9]{1,3})?$/,
  
  // Solo números
  NUMEROS: /^[0-9]+$/,
  
  // Solo números con decimales (para peso, precio)
  NUMEROS_DECIMALES: /^[0-9]+(\.[0-9]{1,2})?$/,
  
  // Texto con caracteres especiales limitados
  DESCRIPCION: /^[a-záéíóúñ0-9\s.,;:!?()'-]{0,1000}$/i,
  
  // Código QR o número de guía
  CODIGO: /^[a-zA-Z0-9-]{5,50}$/,
  
  // Ciudad válida (letras, espacios, guiones)
  CIUDAD: /^[a-záéíóúñ\s'-]{2,50}$/i,
};

// ============================================================================
// CARACTERES BLOQUEADOS
// ============================================================================

const CARACTERES_PROHIBIDOS = {
  // Caracteres inyección SQL
  SQL: /['";\\]/g,
  
  // Caracteres peligrosos para XSS
  XSS: /[<>{}[\]]/g,
  
  // Caracteres de control
  CONTROL: /[\x00-\x1F\x7F]/g,
};

// ============================================================================
// FUNCIONES DE VALIDACIÓN BÁSICAS
// ============================================================================

/**
 * Limpia caracteres peligrosos de una cadena
 * @param {string} text - Texto a limpiar
 * @returns {string} Texto limpio
 */
export const sanitizeInput = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  let cleaned = text;
  // Remover caracteres de inyección
  cleaned = cleaned.replace(CARACTERES_PROHIBIDOS.SQL, '');
  cleaned = cleaned.replace(CARACTERES_PROHIBIDOS.XSS, '');
  cleaned = cleaned.replace(CARACTERES_PROHIBIDOS.CONTROL, '');
  
  return cleaned.trim();
};


export const isClean = (text) => {
  if (!text) return true;
  return !CARACTERES_PROHIBIDOS.SQL.test(text) &&
         !CARACTERES_PROHIBIDOS.XSS.test(text) &&
         !CARACTERES_PROHIBIDOS.CONTROL.test(text);
};


export const validarNombre = (value) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: 'El nombre es requerido' };
  }
  
  if (value.length < 2) {
    return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  if (value.length > 100) {
    return { isValid: false, error: 'El nombre no puede exceder 100 caracteres' };
  }
  
  if (!/^[a-záéíóúñ\s'-]+$/i.test(value)) {
    return { isValid: false, error: 'El nombre contiene caracteres inválidos' };
  }
  
  if (/[0-9]/.test(value)) {
    return { isValid: false, error: 'El nombre no puede contener números' };
  }
  
  return { isValid: true, error: null };
};


export const validarEmail = (value) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: 'El email es requerido' };
  }
  
  if (value.length > 100) {
    return { isValid: false, error: 'El email es muy largo' };
  }
  
  if (!PATTERNS.EMAIL.test(value)) {
    return { isValid: false, error: 'El email no es válido' };
  }
  
  // Verificar que no tenga espacios
  if (value.includes(' ')) {
    return { isValid: false, error: 'El email no puede contener espacios' };
  }
  
  return { isValid: true, error: null };
};


export const validarTelefono = (value) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: 'El teléfono es requerido' };
  }
  
  // Remover espacios, guiones, paréntesis para contar dígitos
  const soloDigitos = value.replace(/\D/g, '');
  
  if (soloDigitos.length < 7) {
    return { isValid: false, error: 'El teléfono debe tener al menos 7 dígitos' };
  }
  
  if (soloDigitos.length > 15) {
    return { isValid: false, error: 'El teléfono no puede exceder 15 dígitos' };
  }
  
  if (!PATTERNS.TELEFONO.test(value)) {
    return { isValid: false, error: 'El formato del teléfono no es válido' };
  }
  
  return { isValid: true, error: null };
};


export const validarCI = (value) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: 'La cédula/DNI es requerida' };
  }
  
  // Permitir formato: 1234567 o 1234567-89
  const soloDigitos = value.replace(/\D/g, '');
  
  if (soloDigitos.length < 4) {
    return { isValid: false, error: 'La cédula/DNI debe tener al menos 4 dígitos' };
  }
  
  if (soloDigitos.length > 20) {
    return { isValid: false, error: 'La cédula/DNI es muy larga' };
  }
  
  if (!/^[0-9-]{4,20}$/.test(value)) {
    return { isValid: false, error: 'La cédula/DNI solo puede contener números y guiones' };
  }
  
  return { isValid: true, error: null };
};

export const validarDireccion = (value) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: 'La dirección es requerida' };
  }
  
  if (value.length < 5) {
    return { isValid: false, error: 'La dirección es muy corta (mínimo 5 caracteres)' };
  }
  
  if (value.length > 200) {
    return { isValid: false, error: 'La dirección es muy larga (máximo 200 caracteres)' };
  }
  
  // Permitir: letras, números, espacios, puntos, comas, guiones, #
  if (!/^[a-záéíóúñ0-9\s.,#-]+$/i.test(value)) {
    return { isValid: false, error: 'La dirección contiene caracteres no permitidos' };
  }

  // Validar que NO sea solo números
  if (/^\d+$/.test(value.trim())) {
    return { isValid: false, error: 'El número de casa contiene caracteres inválidos' };
  }

  // Validar que tenga al menos una letra
  if (!/[a-záéíóúñ]/i.test(value)) {
    return { isValid: false, error: 'La dirección debe contener al menos una letra' };
  }
  
  return { isValid: true, error: null };
};


export const validarNumero = (value, fieldName = 'número') => {
  if (!value || !value.trim()) {
    return { isValid: true, error: null }; // Opcional
  }
  
  if (value.length > 10) {
    return { isValid: false, error: `El ${fieldName} es muy largo` };
  }
  
  if (!/^[0-9a-zA-Z\s-/]+$/.test(value)) {
    return { isValid: false, error: `El ${fieldName} contiene caracteres inválidos` };
  }
  
  return { isValid: true, error: null };
};


export const validarCiudad = (value) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: 'La ciudad es requerida' };
  }
  
  if (value.length > 50) {
    return { isValid: false, error: 'La ciudad es muy larga' };
  }
  
  if (!/^[a-záéíóúñ\s'-]+$/i.test(value)) {
    return { isValid: false, error: 'La ciudad contiene caracteres inválidos' };
  }
  
  return { isValid: true, error: null };
};

export const validarPeso = (value) => {
  if (!value || value === '') {
    return { isValid: false, error: 'El peso es requerido' };
  }
  
  const peso = parseFloat(value);
  
  if (isNaN(peso)) {
    return { isValid: false, error: 'El peso debe ser un número' };
  }
  
  if (peso <= 0) {
    return { isValid: false, error: 'El peso debe ser mayor a 0' };
  }
  
  if (peso > 1000) {
    return { isValid: false, error: 'El peso no puede exceder 1000 kg' };
  }
  
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return { isValid: false, error: 'El peso puede tener máximo 2 decimales' };
  }
  
  return { isValid: true, error: null };
};


export const validarPrecio = (value) => {
  if (!value || value === '') {
    return { isValid: false, error: 'El precio es requerido' };
  }
  
  const precio = parseFloat(value);
  
  if (isNaN(precio)) {
    return { isValid: false, error: 'El precio debe ser un número' };
  }
  
  if (precio < 0) {
    return { isValid: false, error: 'El precio no puede ser negativo' };
  }
  
  if (precio > 999999) {
    return { isValid: false, error: 'El precio es demasiado alto' };
  }
  
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return { isValid: false, error: 'El precio puede tener máximo 2 decimales' };
  }
  
  return { isValid: true, error: null };
};


export const validarDescripcion = (value, maxLength = 1000) => {
  if (!value) {
    return { isValid: true, error: null }; // Opcional
  }
  
  if (value.length < 3 && value.trim().length > 0) {
    return { isValid: false, error: 'La descripción debe tener al menos 3 caracteres' };
  }
  
  if (value.length > maxLength) {
    return { isValid: false, error: `La descripción no puede exceder ${maxLength} caracteres` };
  }
  
  // Permitir letras, números, espacios, puntuación básica
  if (!/^[a-záéíóúñ0-9\s.,;:!?()'\"-]*$/i.test(value)) {
    return { isValid: false, error: 'La descripción contiene caracteres no permitidos' };
  }
  
  return { isValid: true, error: null };
};


export const validarCodigoGuia = (value) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: 'El número de guía es requerido' };
  }
  
  if (value.length < 5) {
    return { isValid: false, error: 'El número de guía es muy corto' };
  }
  
  if (value.length > 50) {
    return { isValid: false, error: 'El número de guía es muy largo' };
  }
  
  if (!/^[a-zA-Z0-9-]{5,50}$/.test(value)) {
    return { isValid: false, error: 'El número de guía contiene caracteres inválidos' };
  }
  
  return { isValid: true, error: null };
};


export const validarTipoVehiculo = (value) => {
  const vehiculosValidos = ['bicicleta', 'moto', 'carro', 'camión', 'otro'];
  
  if (!value || !value.trim()) {
    return { isValid: false, error: 'El tipo de vehículo es requerido' };
  }
  
  if (!vehiculosValidos.includes(value.toLowerCase())) {
    return { isValid: false, error: 'Tipo de vehículo no válido' };
  }
  
  return { isValid: true, error: null };
};


export const validarEstado = (value, estadosValidos = ['pendiente', 'respondida']) => {
  if (!value || !value.trim()) {
    return { isValid: false, error: 'El estado es requerido' };
  }
  
  if (!estadosValidos.includes(value.toLowerCase())) {
    return { isValid: false, error: `Estado no válido. Permitidos: ${estadosValidos.join(', ')}` };
  }
  
  return { isValid: true, error: null };
};


export const validarPassword = (value) => {
  if (!value) {
    return { isValid: false, error: 'La contraseña es requerida' };
  }
  
  if (value.length < 6) {
    return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }
  
  if (value.length > 50) {
    return { isValid: false, error: 'La contraseña es muy larga' };
  }
  
  // Debe tener al menos una letra y un número
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
    return { isValid: false, error: 'La contraseña debe contener letras y números' };
  }
  
  return { isValid: true, error: null };
};


export const validarConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Debe confirmar la contraseña' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Las contraseñas no coinciden' };
  }
  
  return { isValid: true, error: null };
};


export const validarFormularioPaquete = (formData) => {
  const errors = {};
  
  // Campos de destinatario
  if (!validarNombre(formData.nombre_destinatario).isValid) {
    errors.nombre_destinatario = validarNombre(formData.nombre_destinatario).error;
  }
  
  if (!validarNombre(formData.apellido_destinatario).isValid) {
    errors.apellido_destinatario = validarNombre(formData.apellido_destinatario).error;
  }
  
  if (!validarCI(formData.ci_destinatario).isValid) {
    errors.ci_destinatario = validarCI(formData.ci_destinatario).error;
  }
  
  if (!validarEmail(formData.email_destinatario).isValid) {
    errors.email_destinatario = validarEmail(formData.email_destinatario).error;
  }
  
  if (!validarTelefono(formData.telefono_destinatario).isValid) {
    errors.telefono_destinatario = validarTelefono(formData.telefono_destinatario).error;
  }
  
  // Dirección
  if (!validarDireccion(formData.direccion_destino).isValid) {
    errors.direccion_destino = validarDireccion(formData.direccion_destino).error;
  }
  
  // Números opcionales
  if (formData.numero_casa && !validarNumero(formData.numero_casa, 'número de casa').isValid) {
    errors.numero_casa = validarNumero(formData.numero_casa, 'número de casa').error;
  }
  
  if (formData.numero_departamento && !validarNumero(formData.numero_departamento, 'número de departamento').isValid) {
    errors.numero_departamento = validarNumero(formData.numero_departamento, 'número de departamento').error;
  }
  
  // Ciudad
  if (!validarCiudad(formData.ciudad_destino).isValid) {
    errors.ciudad_destino = validarCiudad(formData.ciudad_destino).error;
  }
  
  // Peso y precio
  if (!validarPeso(formData.peso).isValid) {
    errors.peso = validarPeso(formData.peso).error;
  }
  
  if (!validarPrecio(formData.precio_envio).isValid) {
    errors.precio_envio = validarPrecio(formData.precio_envio).error;
  }
  
  // Descripción
  if (!validarDescripcion(formData.contenido).isValid) {
    errors.contenido = validarDescripcion(formData.contenido).error;
  }
  
  return errors;
};


export const validarFormularioRepartidor = (formData) => {
  const errors = {};
  
  // Nombre
  if (!validarNombre(formData.nombre_completo).isValid) {
    errors.nombre_completo = validarNombre(formData.nombre_completo).error;
  }
  
  // Email
  if (!validarEmail(formData.email).isValid) {
    errors.email = validarEmail(formData.email).error;
  }
  
  // Teléfono
  if (!validarTelefono(formData.telefono).isValid) {
    errors.telefono = validarTelefono(formData.telefono).error;
  }
  
  // CI
  if (!validarCI(formData.numero_ci).isValid) {
    errors.numero_ci = validarCI(formData.numero_ci).error;
  }
  
  // Ciudad
  if (!validarCiudad(formData.ciudad).isValid) {
    errors.ciudad = validarCiudad(formData.ciudad).error;
  }
  
  // Tipo de vehículo
  if (!validarTipoVehiculo(formData.tipo_vehiculo).isValid) {
    errors.tipo_vehiculo = validarTipoVehiculo(formData.tipo_vehiculo).error;
  }
  
  // Contraseña
  if (formData.password && !validarPassword(formData.password).isValid) {
    errors.password = validarPassword(formData.password).error;
  }
  
  // Confirmación de contraseña
  if (formData.password && formData.confirmPassword) {
    const confirmResult = validarConfirmPassword(formData.password, formData.confirmPassword);
    if (!confirmResult.isValid) {
      errors.confirmPassword = confirmResult.error;
    }
  }
  
  return errors;
};


export const validarFormularioRespuestaIncidencia = (formData) => {
  const errors = {};
  
  if (!validarDescripcion(formData.respuesta_admin, 500).isValid) {
    errors.respuesta_admin = validarDescripcion(formData.respuesta_admin, 500).error;
  }
  
  return errors;
};

export default {
  sanitizeInput,
  isClean,
  validarNombre,
  validarEmail,
  validarTelefono,
  validarCI,
  validarDireccion,
  validarNumero,
  validarCiudad,
  validarPeso,
  validarPrecio,
  validarDescripcion,
  validarCodigoGuia,
  validarTipoVehiculo,
  validarEstado,
  validarPassword,
  validarConfirmPassword,
  validarFormularioPaquete,
  validarFormularioRepartidor,
  validarFormularioRespuestaIncidencia,
  PATTERNS,
  CARACTERES_PROHIBIDOS
};
