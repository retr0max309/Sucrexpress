import { create } from 'zustand';
import apiClient from '@/lib/apiClient';

export const useAuthStore = create((set, get) => {
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < (currentTime + 60);
    } catch (error) {
      console.log('Error al verificar expiración del token:', error);
      return true;
    }
  };

  const loadFromStorage = () => {
    if (typeof window === 'undefined') {
      return { usuario: null, isLoggedIn: false, user: null, token: null };
    }
    
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        if (isTokenExpired(token)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return { usuario: null, isLoggedIn: false, user: null, token: null };
        }
        
        const userData = JSON.parse(user);
        return { usuario: userData.Usuario, isLoggedIn: true, user: userData, token: token };
      }
    } catch (error) {
      console.error('Error cargando datos del storage:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return { usuario: null, isLoggedIn: false, user: null, token: null };
  };

  return {
    ...loadFromStorage(),

    login: (userData, token) => {
      if (isTokenExpired(token)) {
        console.error('Intento de login con token expirado');
        return false;
      }

      const user = typeof userData === 'string' ? { Usuario: userData } : userData;

      if (token) {
        localStorage.setItem('token', token);
      }

      localStorage.setItem('user', JSON.stringify(user));

      set({
        usuario: user.Usuario,
        isLoggedIn: true,
        user: user,
        token: token || get().token
      });

      console.log('Usuario logueado:', user.Usuario);
      return true;
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      set({
        usuario: null,
        isLoggedIn: false,
        user: null,
        token: null
      });

      console.log('Usuario deslogueado');
    },

    checkAuth: () => {
      const data = loadFromStorage();
      set(data);
      return data.isLoggedIn;
    },

    verifyToken: async () => {
      const token = localStorage.getItem('token');
      
      if (!token || isTokenExpired(token)) {
        get().logout();
        return false;
      }

      try {
        const response = await apiClient.get('/auth/verify');
        const data = response.data;

        if (data.success) {
          set({
            usuario: data.data?.user?.Usuario,
            isLoggedIn: true,
            user: data.data?.user,
            token: token
          });
          return true;
        } else {
          get().logout();
          return false;
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        
        if (!isTokenExpired(token)) {
          return get().isLoggedIn;
        } else {
          get().logout();
          return false;
        }
      }
    },

    ensureValidToken: async () => {
      const { token, isLoggedIn } = get();
      
      if (!isLoggedIn || !token) {
        return false;
      }

      if (isTokenExpired(token)) {
        get().logout();
        return false;
      }

      return true;
    },

    getCurrentUser: () => {
      return get().user;
    },

    hasRole: (roleCode) => {
      const user = get().user;
      return user && user.codigo_tu === roleCode;
    },

    updateUser: (newUserData) => {
      const currentUser = get().user;
      const updatedUser = { ...currentUser, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      set({
        user: updatedUser,
        usuario: updatedUser.Usuario
      });
    }
  };
});
