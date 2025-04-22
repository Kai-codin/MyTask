import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = Cookies.get('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    // Update cookie when theme changes
    Cookies.set('theme', isDarkMode ? 'dark' : 'light', { expires: 365 });
    // Update body class for global styles
    document.body.className = isDarkMode ? 'dark-mode' : '';
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 