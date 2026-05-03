import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { DonationProvider } from "./context/DonationContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DonationProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DonationProvider>
  </React.StrictMode>
)
