import { createContext, useEffect, useState } from 'react';
import { me as fetchMe } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('chefstation_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetchMe()
      .then(({ data }) => {
        setUser(data.user);
        setRestaurant(data.restaurant);
      })
      .catch(() => {
        localStorage.removeItem('chefstation_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = ({ token, user: nextUser, restaurant: nextRestaurant }) => {
    localStorage.setItem('chefstation_token', token);
    setUser(nextUser);
    setRestaurant(nextRestaurant || null);
  };

  const logout = () => {
    localStorage.removeItem('chefstation_token');
    setUser(null);
    setRestaurant(null);
  };

  return (
    <AuthContext.Provider value={{ user, restaurant, loading, login, logout, setRestaurant }}>
      {children}
    </AuthContext.Provider>
  );
}
