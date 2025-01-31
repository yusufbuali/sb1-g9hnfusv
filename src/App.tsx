import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import { useAuthStore } from './store/authStore';

// Import department routes
import { registrationRoutes } from './features/registration/routes';
import { forensicsRoutes } from './features/forensics/routes';

function App() {
  const { user } = useAuthStore();

  const getAuthorizedRoutes = () => {
    const routes = [];
    
    if (user?.role === 'registration' || user?.role === 'admin') {
      routes.push(...registrationRoutes);
    }
    
    if (user?.role === 'forensics' || user?.role === 'forensics_head' || user?.role === 'admin') {
      routes.push(...forensicsRoutes);
    }
    
    return routes;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />

        {/* Protected routes */}
        {user ? (
          <Route path="/" element={<Layout />}>
            {getAuthorizedRoutes().map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;