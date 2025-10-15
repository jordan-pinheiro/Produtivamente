import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

// 1. (Opcional, mas recomendado) Definir a interface do Usuário para usar no lugar de 'any'
interface User {
  _id: string;
  name: string;
  email: string;
  level: number;
  points: number;
  createdAt: string;
}

// 2. Adicionar a função reloadUser à interface de tipos
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  reloadUser: () => void; // <-- Nova função adicionada
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Mover a função checkAuth para fora do useEffect para poder ser reutilizada
  // Usamos useCallback para otimização, evitando que a função seja recriada a cada renderização
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      axios.defaults.headers.common['x-auth-token'] = token;
      const res = await axios.get(`http://localhost:5000/api/users/me`);
      
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['x-auth-token'];
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. O useEffect agora apenas chama a checkAuth na montagem do componente
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`http://localhost:5000/api/users/login`, {
        email,
        password
      });
      
      localStorage.setItem('token', res.data.token);
      await checkAuth(); // Reutilizamos a função aqui para buscar os dados do usuário

    } catch (err: any) {
      setError(err.response?.data?.msg || 'Erro ao fazer login');
      setLoading(false); // Garante que loading seja false em caso de erro
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`http://localhost:5000/api/users/register`, {
        name,
        email,
        password
      });
      
      localStorage.setItem('token', res.data.token);
      await checkAuth(); // Reutilizamos a função aqui também

    } catch (err: any) {
      setError(err.response?.data?.msg || 'Erro ao registrar');
      setLoading(false); // Garante que loading seja false em caso de erro
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setIsAuthenticated(false);
    setUser(null);
  };
  
  // 5. Definir a nova função reloadUser
  const reloadUser = () => {
    // A função é simples: apenas chama checkAuth para buscar os dados mais recentes do servidor
    setLoading(true); // Ativa o loading para dar feedback na UI
    checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout,
        reloadUser // <-- 6. Exponha a nova função aqui
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};