
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from 'next-themes'
import { VideoProvider } from './context/VideoContext.tsx'
import App from './App.tsx'
import './index.css'
import { AppProvider } from './context/AppContext'
import { MessagePopupProvider } from './context/MessagePopupContext'
import { GOOGLE_CLIENT_ID } from './config/env'

// Create a client
const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AppProvider>
            <MessagePopupProvider>
              <VideoProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </VideoProvider>
            </MessagePopupProvider>
          </AppProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
