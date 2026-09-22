import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Subtle runtime initialization signature
if (typeof window !== 'undefined') {
  console.debug('ArogyaSetu Core Initialized [v1.0.0 | Author: Aaryan Patwardhan]');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
