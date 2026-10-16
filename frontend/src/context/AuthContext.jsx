import React, { useState } from 'react';
import { DEMO_USERS } from './demoUsers';
import { AuthContext } from './authContextDef';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('shopsense_auth_user') || localStorage.getItem('shopsense_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password, presetKey = null) => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 250));

    let userData;
    if (presetKey && DEMO_USERS[presetKey]) {
      userData = DEMO_USERS[presetKey];
    } else {
      userData = {
        id: 'user-admin-1',
        name: 'Siri Admin',
        email: email ? email.trim() : 'admin@shopsense.com',
        role: 'Platform Administrator',
        avatar: 'SA',
        title: 'Platform Administrator',
      };
    }

    setUser(userData);
    sessionStorage.setItem('shopsense_auth_user', JSON.stringify(userData));
    localStorage.setItem('shopsense_auth_user', JSON.stringify(userData));
    setLoading(false);
    return userData;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('shopsense_auth_user');
    localStorage.removeItem('shopsense_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
