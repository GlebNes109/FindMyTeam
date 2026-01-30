import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import {CssBaseline} from '@mui/material';
import { CssVarsProvider } from '@mui/material/styles';
import theme from './theme';
import {ToastProvider} from "./components/ToastProvider.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <CssVarsProvider theme={theme} defaultMode="system" modeStorageKey="themeMode">
          <CssBaseline />
              <App />
      </CssVarsProvider>
  </StrictMode>,
)
