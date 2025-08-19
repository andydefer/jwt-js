import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';


export const useAuth = () => {
  const {
    token,
    user,
    isLoading,
    error,
    login,
    logout,
    register,
    initialize,
    isInitialized,
  } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) initialize();
  }, [initialize, isInitialized]);

  return {
    isAuthenticated: !!token,
    user,
    isLoading,
    error,
    login,
    logout,
    register,
  };
};
