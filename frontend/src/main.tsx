import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '../App.tsx'
import { AuthProvider } from '../contexts/AuthContext.tsx'
import { LanguageProvider } from '../contexts/LanguageContext.tsx'
import { ContentProvider } from '../contexts/ContentContext.tsx'
import '../index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ContentProvider>
        <LanguageProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LanguageProvider>
      </ContentProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
