'use client';
// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import apiClient from '@/lib/apiClient';

const SucreExpressLogin = () => {
  const [isActive, setIsActive] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', clave: '' });
  const [registerData, setRegisterData] = useState({ 
    nuevoUsuario: '', 
    nuevoCorreo: '', 
    nuevaClave: '',
    confirmClave: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login: setAuthUser, isLoggedIn } = useAuthStore();

  // Redireccionar si ya está logueado
  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/admin');
    }
  }, [isLoggedIn, router]);

  // Validar que sea Gmail
  const isGmail = (email) => {
    return email.toLowerCase().endsWith('@gmail.com');
  };

  // FUNCIÓN DE LOGIN - Ahora con email
  const handleLoginSubmit = async (e) => {
  e.preventDefault();

  if (!loginData.email || !loginData.clave) {
    toast.error('Por favor completa todos los campos');
    return;
  }

  if (!isGmail(loginData.email)) {
    toast.error('Solo se permiten cuentas de Gmail (@gmail.com)');
    return;
  }

  setIsLoading(true);

  try {
    const response = await apiClient.post('/auth/login', {
      email: loginData.email,
      password: loginData.clave,
    });

    const data = response.data;

    if (data.success) {
      localStorage.setItem('token', data.data.token);
      console.log('Token guardado en localStorage:', data.data.token);
      setAuthUser(data.data.user, data.data.token);
      toast.success(`Bienvenido ${data.data.user.Usuario}`);

      setLoginData({ email: '', clave: '' });

      setTimeout(() => {
        router.replace('/admin');
      }, 1000);
    } else {
      toast.error(data.message || 'Credenciales incorrectas');
    }
  } catch (error) {
    console.error('Error de conexion:', error);
    toast.error('Error de conexion. Verifica que el servidor este funcionando.');
  } finally {
    setIsLoading(false);
  }
};


  // FUNCIÓN DE REGISTRO - Con validaciones de Gmail
  const handleRegisterSubmit = async (e) => {
  e.preventDefault();

  if (!registerData.nuevoUsuario || !registerData.nuevoCorreo || 
      !registerData.nuevaClave || !registerData.confirmClave) {
    toast.error('Por favor completa todos los campos');
    return;
  }

  if (!isGmail(registerData.nuevoCorreo)) {
    toast.error('Solo se permiten cuentas de Gmail (@gmail.com)');
    return;
  }

  if (registerData.nuevaClave !== registerData.confirmClave) {
    toast.error('Las contrasenas no coinciden');
    return;
  }

  if (registerData.nuevaClave.length < 6) {
    toast.error('La contrasena debe tener al menos 6 caracteres');
    return;
  }

  setIsLoading(true);

  try {
    const response = await apiClient.post('/auth/register', {
      usuario: registerData.nuevoUsuario,
      email: registerData.nuevoCorreo,
      password: registerData.nuevaClave,
    });

    const data = response.data;

    if (data.success) {
      localStorage.setItem('token', data.data.token);
      console.log('Token guardado en localStorage:', data.data.token);
      setAuthUser(data.data.user, data.data.token);
      toast.success(`Bienvenido ${data.data.user.Usuario} Registro exitoso`);

      setRegisterData({ 
        nuevoUsuario: '', 
        nuevoCorreo: '', 
        nuevaClave: '', 
        confirmClave: '' 
      });

      setTimeout(() => {
        router.replace('/admin');
      }, 1000);
    } else {
      toast.error(data.message || 'Error en el registro');
    }
  } catch (error) {
    console.error('Error de conexion en registro:', error);
    toast.error('Error de conexion. Verifica que el servidor este funcionando.');
  } finally {
    setIsLoading(false);
  }
};


  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      fontFamily: "'Poppins', sans-serif",
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(90deg, #e2e2e2, #c9d6c9)'
    }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
          @import url('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css');

          .login-container {
            position: relative;
            width: 850px;
            height: 550px;
            background: #C4D3EA;
            border-radius: 30px;
            box-shadow: 0 0 30px rgba(0, 0, 0, .2);
            overflow: hidden;
            margin: 20px;
          }

          .form-box {
            position: absolute;
            right: 0;
            width: 50%;
            height: 100%;
            background: #3A4E7A;
            display: flex;
            align-items: center;
            color: #333;
            text-align: center;
            padding: 40px;
            z-index: 2;
            transition: .6s ease-in-out 1.2s, visibility 0s 1s;
          }

          .login-container.active .form-box {
            right: 50%;
          }

          .form-box.register {
            visibility: hidden;
          }

          .login-container.active .form-box.register {
            visibility: visible;
          }

          .login-form {
            width: 100%;
          }

          .form-box h1 {
            font-size: 36px;
            margin: -10px 0 20px;
            color: #ffffff !important;
            font-weight: 700;
          }

          .input-box {
            position: relative;
            margin: 30px 0;
          }

          .input-box input {
            width: 100%;
            padding: 13px 50px 13px 20px;
            background-color: #ffffff;
            border-radius: 8px;
            border: none;
            outline: none;
            font-size: 16px;
            color: #1a1a1a !important;
            font-weight: 500;
          }

          .input-box input::placeholder {
            color: #666666 !important;
            font-weight: 400;
          }

          .input-box input:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .input-box i {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 20px;
            color: #3A4E7A;
          }

          .forgot-link {
            margin: -15px 0 15px;
          }

          .forgot-link a {
            font-size: 14.5px;
            color: #ffffff !important;
            text-decoration: none;
          }

          .btn {
            width: 100%;
            height: 48px;
            background: #2CA880;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, .1);
            border: none;
            cursor: pointer;
            font-size: 16px;
            color: #ffffff !important;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            background: #6c757d;
          }

          .btn:hover:not(:disabled) {
            background-color: orange;
            transition: background-color 0.3s ease;
          }

          .toggle-box {
            position: absolute;
            width: 100%;
            height: 100%;
          }

          .toggle-panel {
            position: absolute;
            width: 50%;
            height: 100%;
            color: #fff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 2;
            transition: .6s ease-in-out;
            padding: 0 30px;
            text-align: center;
          }

          .toggle-panel h1 {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #ffffff !important;
          }

          .toggle-panel p {
            font-size: 16px;
            margin-bottom: 20px;
            color: #ffffff !important;
          }

          .toggle-panel .btn {
            width: 160px;
            height: 46px;
            background: transparent;
            border: 2px solid #fff;
            box-shadow: none;
            font-weight: 600;
            color: #ffffff !important;
          }

          .toggle-panel.toggle-left {
            left: 0;
            transition-delay: 1.2s;
          }

          .login-container.active .toggle-panel.toggle-left {
            left: -50%;
            transition-delay: .6s;
          }

          .toggle-panel.toggle-right {
            right: -50%;
            transition-delay: .6s;
          }

          .login-container.active .toggle-panel.toggle-right {
            right: 0;
            transition-delay: .6s;
          }

          .h1_log {
            width: 100%;
            max-width: 300px;
            text-align: right;
            padding-right: 40px;
            font-size: 32px;
            font-weight: 700;
            color: #ffffff !important;
          }

          .login-text {
            color: #ffffff !important;
            margin-top: 20px;
          }

          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #ffffff;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div className={`login-container ${isActive ? 'active' : ''}`}>
        {/* Login Form */}
        <div className="form-box login">
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <h1>Login</h1>
            <div className="input-box">
              <input
                type="email"
                name="email"
                placeholder="Gmail (@gmail.com)"
                value={loginData.email}
                onChange={handleLoginChange}
                disabled={isLoading}
                required
              />
              <i className='bx bxs-envelope'></i>
            </div>
            <div className="input-box">
              <input
                type="password"
                name="clave"
                placeholder="Contraseña"
                value={loginData.clave}
                onChange={handleLoginChange}
                disabled={isLoading}
                required
              />
              <i className='bx bxs-lock'></i>
            </div>
            <div className="forgot-link">
              <a href="#" onClick={(e) => e.preventDefault()}>¿Olvidaste tu contraseña?</a>
            </div>
            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Ingresando...
                </>
              ) : (
                'Logearse'
              )}
            </button>
            <p className="login-text">Logearse con diferentes plataformas:</p>
          </form>
        </div>

        {/* Registro */}
        <div className="form-box register">
          <form className="login-form" onSubmit={handleRegisterSubmit}>
            <h1>Registrarse</h1>
            <div className="input-box">
              <input
                type="text"
                name="nuevoUsuario"
                placeholder="Nombre de Usuario"
                value={registerData.nuevoUsuario}
                onChange={handleRegisterChange}
                disabled={isLoading}
                required
              />
              <i className='bx bxs-user-detail'></i>
            </div>
            <div className="input-box">
              <input
                type="email"
                name="nuevoCorreo"
                placeholder="Gmail (@gmail.com)"
                value={registerData.nuevoCorreo}
                onChange={handleRegisterChange}
                disabled={isLoading}
                required
              />
              <i className='bx bxs-envelope'></i>
            </div>
            <div className="input-box">
              <input
                type="password"
                name="nuevaClave"
                placeholder="Contraseña"
                value={registerData.nuevaClave}
                onChange={handleRegisterChange}
                disabled={isLoading}
                required
              />
              <i className='bx bxs-lock'></i>
            </div>
            <div className="input-box">
              <input
                type="password"
                name="confirmClave"
                placeholder="Confirmar Contraseña"
                value={registerData.confirmClave}
                onChange={handleRegisterChange}
                disabled={isLoading}
                required
              />
              <i className='bx bxs-lock-alt'></i>
            </div>
            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Registrando...
                </>
              ) : (
                'Registrarse'
              )}
            </button>
            <p className="login-text">Registrarse con diferentes plataformas:</p>
          </form>
        </div>

        {/* IMAGEN DE FONDO ANIMADA */}
        <div
          className="toggle-bg"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            backgroundImage: `url(${isActive ? '/images/registro2.jpeg' : '/images/login2.jpeg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            borderRadius: isActive ? '0 30px 30px 0' : '30px 0 0 30px',
            transition: 'transform 1.5s ease-in-out, background-image 0.6s ease-in-out',
            transform: isActive ? 'translateX(100%)' : 'translateX(0%)',
            zIndex: 1
          }}
        ></div>

        {/* Panel de texto animado */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Bienvenido de vuelta!</h1>
            <p>¿No tienes una cuenta aún?</p>
            <button 
              type="button"
              className="btn" 
              onClick={() => setIsActive(true)}
              disabled={isLoading}
            >
              Registrarse
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1 className="h2_log">Bienvenido a SucreExpress</h1>
            <p>¿Ya tienes una cuenta?</p>
            <button 
              type="button"
              className="btn" 
              onClick={() => setIsActive(false)}
              disabled={isLoading}
            >
              Logearse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SucreExpressLogin;
