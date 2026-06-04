import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (userData, authToken) => {
  setUser(userData);
  setToken(authToken);
  localStorage.setItem('token', authToken);
  localStorage.setItem('userId', userData.id);
  localStorage.setItem('userName', userData.name);
  localStorage.setItem('userPhone', userData.phone || '');
  localStorage.setItem('userRole', userData.role || 'student');
  localStorage.setItem('user', JSON.stringify(userData));
};

const logout = () => {
  setUser(null);
  setToken(null);
  localStorage.clear();
};

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);