import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const MenuModeContext = createContext();

export const MenuModeProvider = ({ children }) => {
  // Default to true (menu only mode) until we fetch from server
  const [menuMode, setMenuMode] = useState(true);
  const [menuModeLoaded, setMenuModeLoaded] = useState(false);

  useEffect(() => {
    const fetchMenuMode = async () => {
      try {
        const res = await api.get('/api/business-status');
        const data = res.data?.data || res.data || {};
        // menu_mode: 1 = menu only, 0 = full ordering
        setMenuMode(!!data.menu_mode);
      } catch (err) {
        console.error('Failed to fetch menu mode:', err);
        // Keep default (menu only) on error
      } finally {
        setMenuModeLoaded(true);
      }
    };
    fetchMenuMode();
  }, []);

  return (
    <MenuModeContext.Provider value={{ menuMode, setMenuMode, menuModeLoaded }}>
      {children}
    </MenuModeContext.Provider>
  );
};

export const useMenuMode = () => useContext(MenuModeContext);
