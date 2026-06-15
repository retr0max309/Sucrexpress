'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!token) {
      router.replace('/login');
    }
  }, [isMounted, token, router]);

  // Mientras se está montando el componente en el cliente,
  // mostramos un spinner para evitar pantalla negra
  if (!isMounted) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#1a1a2e',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: '4px solid rgba(255,255,255,0.2)',
            borderTop: '4px solid #2CA880',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Sin token → redirige al login (el useEffect lo maneja), mostramos nada
  if (!token) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
