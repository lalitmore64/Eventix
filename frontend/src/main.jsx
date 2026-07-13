import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios';
import './index.css'
import App from './App.jsx'

let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
if (apiBaseUrl && !apiBaseUrl.startsWith('http://') && !apiBaseUrl.startsWith('https://')) {
  apiBaseUrl = `https://${apiBaseUrl}`;
}
axios.defaults.baseURL = apiBaseUrl;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
