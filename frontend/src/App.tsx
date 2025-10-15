import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Contextos
import { AuthProvider } from './contexts/AuthContext';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';
import AIRecommendations from './pages/AIRecommendations';

// Componentes
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4335A7', // Roxo
    },
    secondary: {
      main: '#FF7F3E', // Laranja para CTAs e destaques
    },
    background: {
      default: '#FFF6E9', // Fundo principal da página
      paper: '#FFFFFF',   // Fundo dos cards
    },
    info: {
      main: '#80C4E9', // Azul para informações
    },
    // Você também pode definir as cores de sucesso e erro
    success: {
      main: '#2E7D32',
    },
    error: {
      main: '#D32F2F',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif', // Sugestão de uma nova fonte
    h4: {
      fontWeight: 700, // Títulos mais fortes
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    // Ajuste global para os Cards
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Bordas mais arredondadas
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // Sombra mais suave
        },
      },
    },
    // Ajuste global para os Botões
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Bordas mais arredondadas
          textTransform: 'none', // Remove o ALL CAPS padrão
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/tasks" element={
              <PrivateRoute>
                <Tasks />
              </PrivateRoute>
            } />
            <Route path="/achievements" element={
              <PrivateRoute>
                <Achievements />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/ai-recommendations" element={
              <PrivateRoute>
                <AIRecommendations />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
