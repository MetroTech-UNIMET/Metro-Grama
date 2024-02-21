import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// REVIEW - Bug en minimap QueryClientProvider si está estricto
ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <App />
  </>,
)
