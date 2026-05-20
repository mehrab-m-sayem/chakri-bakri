// ============================================================
// main.jsx — ENTRY POINT
// ============================================================
// This is where React starts. It takes the <App /> component
// and renders it inside the <div id="root"> in index.html.
//
// Think of it as the "starting line" — similar to how your
// backend's index.js calls app.listen() to start the server.
// ============================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
