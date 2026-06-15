/**
 * 🎣 HOOK PERSONALIZADO PARA VALIDACIONES DEL ADMIN
 * Facilita el uso de validaciones en componentes
 */

import { useState, useCallback } from 'react';
import {
  validarFormularioPaquete,
  validarFormularioRepartidor,
  validarFormularioRespuestaIncidencia,
  sanitizeInput
} from '../utils/adminValidations';

/**
 * Hook para manejar validaciones en formularios del admin
 * @param {object} initialData - Datos iniciales del formulario
 * @param {string} formType - Tipo de formulario ('paquete', 'repartidor', 'incidencia')
 * @returns {object} { formData, errors, setFormData, validateForm, validateField, clearErrors }
 */
export const useAdminFormValidation = (initialData = {}, formType = 'paquete') => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  // Mapeo de funciones de validación por tipo
  const validationFunctions = {
    paquete: validarFormularioPaquete,
    repartidor: validarFormularioRepartidor,
    incidencia: validarFormularioRespuestaIncidencia
  };

  /**
   * Valida el formulario completo
   */
  const validateForm = useCallback(() => {
    const validator = validationFunctions[formType];
    if (!validator) {
      console.error(`Tipo de formulario no reconocido: ${formType}`);
      return true;
    }

    const newErrors = validator(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, formType]);

  /**
   * Valida un campo individual
   */
  const validateField = useCallback((fieldName, value) => {
    // Aquí se pueden agregar validaciones por campo específico
    // según sea necesario
    return true;
  }, []);

  /**
   * Actualiza un campo del formulario y limpia su error
   */
  const updateField = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Limpiar error del campo si existe
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  }, [errors]);

  /**
   * Limpia todos los errores
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Limpia todos los datos
   */
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  /**
   * Sanitiza todos los campos de texto
   */
  const sanitizeFormData = useCallback(() => {
    const sanitized = {};
    Object.keys(formData).forEach(key => {
      if (typeof formData[key] === 'string') {
        sanitized[key] = sanitizeInput(formData[key]);
      } else {
        sanitized[key] = formData[key];
      }
    });
    setFormData(sanitized);
    return sanitized;
  }, [formData]);

  return {
    formData,
    errors,
    setFormData,
    updateField,
    validateForm,
    validateField,
    clearErrors,
    resetForm,
    sanitizeFormData,
    hasErrors: Object.keys(errors).length > 0
  };
};

export default useAdminFormValidation;
