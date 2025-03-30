import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import './index.css'
import App from './App.jsx'
import theme from './config/theme'
import ErrorBoundary from './components/ErrorBoundary'
import { SnackbarProvider } from 'notistack';

// Xử lý lỗi không bắt được
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Xử lý promise rejection không bắt được
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
