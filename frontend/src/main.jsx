import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import {ToastProvider} from "./components/ToastProvider.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastProvider>
          <App />
          </ToastProvider>
      </ThemeProvider>
  </StrictMode>,
)
