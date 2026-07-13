import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Sparkles } from 'lucide-react';

// Lazy loaded page components
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const AnalyzeVideoPage = lazy(() => import('./pages/AnalyzeVideoPage').then(m => ({ default: m.AnalyzeVideoPage })));
const LiveChatPage = lazy(() => import('./pages/LiveChatPage').then(m => ({ default: m.LiveChatPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const AiLearningPage = lazy(() => import('./pages/AiLearningPage').then(m => ({ default: m.AiLearningPage })));
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage').then(m => ({ default: m.AdminPanelPage })));
const PersonalityPage = lazy(() => import('./pages/PersonalityPage').then(m => ({ default: m.PersonalityPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const CategorizePage = lazy(() => import('./pages/CategorizePage').then(m => ({ default: m.CategorizePage })));
const DecisionEnginePage = lazy(() => import('./pages/DecisionEnginePage').then(m => ({ default: m.DecisionEnginePage })));
const BillingPage = lazy(() => import('./pages/BillingPage').then(m => ({ default: m.BillingPage })));

function App() {
  const loadingFallback = (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-250">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 animate-pulse text-white">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 animate-pulse">
          Engage AI loading...
        </p>
      </div>
    </div>
  );

  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={loadingFallback}>
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
                      <Suspense fallback={loadingFallback}>
                        <Routes>
                          <Route path="/" element={<DashboardPage />} />
                          <Route path="/analyze" element={<AnalyzeVideoPage />} />
                          <Route path="/live" element={<LiveChatPage />} />
                          <Route path="/categorize" element={<CategorizePage />} />
                          <Route path="/decision" element={<DecisionEnginePage />} />
                          <Route path="/analytics" element={<AnalyticsPage />} />
                          <Route path="/learning" element={<AiLearningPage />} />
                          <Route path="/admin" element={<AdminPanelPage />} />
                          <Route path="/personality" element={<PersonalityPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/billing" element={<BillingPage />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Suspense>
                    </DashboardLayout>
                  </DashboardProvider>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
