/**
    * @description      : 
    * @author           : Kai
    * @group            : 
    * @created          : 22/04/2025 - 22:59:31
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 22/04/2025
    * - Author          : Kai
    * - Modification    : 
**/
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './Login';
import Tasks from './Tasks';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeContext';
import './components.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
