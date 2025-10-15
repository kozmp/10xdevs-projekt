import { useState } from 'react';

interface UseAuthProps {
  isAuthenticated: boolean;
}

export const useAuth = ({ isAuthenticated: initialIsAuthenticated }: UseAuthProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Błąd podczas wylogowywania');
      }

      setIsAuthenticated(false);
      window.location.href = '/login';
    } catch (error) {
      console.error('Błąd wylogowania:', error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    handleLogout,
  };
};
