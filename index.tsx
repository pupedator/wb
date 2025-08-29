import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ContentProvider } from './contexts/ContentContext.tsx';

// --- Application Entry Point ---
// This is the main file that kicks off the React application.

// 1. Find the root DOM element. The entire application will be rendered inside this div.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// 2. Create a React root. This is the modern way to render React apps.
const root = ReactDOM.createRoot(rootElement);

// 3. Render the application.
// - React.StrictMode is a wrapper that helps with highlighting potential problems in an application.
// - The application is wrapped in several "Context Providers" (AuthProvider, ContentProvider, LanguageProvider).
//   These providers make global data (like user authentication, editable content, and language settings)
//   available to any component in the application tree without having to pass props down manually.
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ContentProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ContentProvider>
    </AuthProvider>
  </React.StrictMode>
);