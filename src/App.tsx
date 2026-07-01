import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzeVideoPage } from './pages/AnalyzeVideoPage';
import { DashboardLayout } from './layouts/DashboardLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <DashboardProvider>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/analyze" element={<AnalyzeVideoPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </DashboardLayout>
                </DashboardProvider>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
