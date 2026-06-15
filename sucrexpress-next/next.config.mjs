/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite acceso al HMR desde la IP de red local de Windows
  allowedDevOrigins: ['169.254.253.206'],

  // Paquetes que solo deben correr en el servidor (Node.js)
  // Evita que Turbopack los intente bundlear para el navegador
  serverExternalPackages: [
    'firebase-admin',
    'jsonwebtoken',
    'bcryptjs',
    '@supabase/supabase-js',
  ],

  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
