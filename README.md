# 🚚 SucreExpress 3.0

Sistema de gestión de paquetería para SucreExpress. Proyecto full-stack compuesto por un frontend en **Next.js** y un backend en **NestJS**, con base de datos en **Supabase**.

## 📁 Estructura del Proyecto

```
SucreExpress3.0/
├── sucrexpress-next/   # Frontend - Next.js 16 + React 19
├── sucrexpress-nest/   # Backend  - NestJS 11 + TypeScript
└── README.md
```

## 🛠️ Tecnologías

| Componente | Tecnología |
|---|---|
| Frontend | Next.js 16, React 19, Bootstrap 5, Framer Motion, Zustand |
| Backend | NestJS 11, Passport JWT, Swagger |
| Base de Datos | Supabase (PostgreSQL en la nube) |
| APIs Externas | Google Maps, Google Routes API |

## 🚀 Instalación y Ejecución

### Requisitos previos
- Node.js >= 18
- npm >= 9
- Cuenta en [Supabase](https://supabase.com) con el proyecto configurado

### 1. Clonar el repositorio
```bash
git clone https://github.com/retr0max309/Sucrexpress.git
cd Sucrexpress
git checkout dev
```

### 2. Configurar variables de entorno
Copiar los archivos de ejemplo y completar con tus credenciales:
```bash
# Frontend
cp sucrexpress-next/.env.example sucrexpress-next/.env

# Backend
cp sucrexpress-nest/.env.example sucrexpress-nest/.env
```
Edita ambos archivos `.env` con tus credenciales de Supabase, JWT y Google APIs.

### 3. Instalar dependencias
```bash
# Frontend
cd sucrexpress-next
npm install

# Backend
cd ../sucrexpress-nest
npm install
```

### 4. Ejecutar en desarrollo
```bash
# Terminal 1 - Backend (puerto 3001)
cd sucrexpress-nest
npm run start:dev

# Terminal 2 - Frontend (puerto 5000)
cd sucrexpress-next
npm run dev
```

### 5. Acceder
- **Frontend:** http://localhost:5000
- **Backend API:** http://localhost:3001
- **Swagger Docs:** http://localhost:3001/api

## 📦 Módulos del Sistema

- **Autenticación** — Login/registro con JWT
- **Paquetes** — Gestión CRUD de paquetes con código QR
- **Repartidores** — Administración de repartidores
- **Rutas** — Optimización de rutas con Google Routes API
- **Incidencias** — Registro y seguimiento de incidencias
- **Reportes** — Generación de reportes
- **Geocodificación** — Resolución de direcciones con Google Maps
- **Sincronizaciones** — Sincronización de datos

## ⚠️ Notas importantes

- Los archivos `.env` **NO** se suben al repositorio por seguridad.
- Usa los archivos `.env.example` como referencia para configurar tus variables.
- La base de datos está en Supabase (nube), no requiere instalación local.
