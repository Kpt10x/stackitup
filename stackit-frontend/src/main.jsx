import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import axios from 'axios';
import './index.css'
import App from './App.jsx'

// Set default base URL for Axios
axios.defaults.baseURL = 'http://localhost:3001';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
