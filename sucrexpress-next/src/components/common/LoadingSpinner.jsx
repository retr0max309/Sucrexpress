'use client';
import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Cargando...' }) => {
  const sizeClasses = {
    small: '',
    medium: '',
    large: ''
  };

  const spinnerSize = {
    small: { width: '1rem', height: '1rem' },
    medium: { width: '2rem', height: '2rem' },
    large: { width: '3rem', height: '3rem' }
  };

  const containerPadding = {
    small: 'p-2',
    medium: 'p-4',
    large: 'p-5'
  };

  return (
    <div className={`d-flex flex-column align-items-center justify-content-center ${containerPadding[size]}`}>
      <div 
        className="spinner-border text-primary"
        role="status"
        style={spinnerSize[size]}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      
      {text && (
        <p className="mt-3 text-muted mb-0">
          {text}
        </p>
      )}
    </div>
  );
};

// Spinner para pantalla completa
export const FullScreenSpinner = ({ text = 'Cargando...' }) => {
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 9999 }}>
      <div className="bg-white rounded shadow-lg p-4 d-flex flex-column align-items-center">
        <LoadingSpinner size="large" text={text} />
      </div>
    </div>
  );
};

export default LoadingSpinner;
