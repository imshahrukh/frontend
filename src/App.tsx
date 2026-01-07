import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Projects from './pages/Projects';
import Salaries from './pages/Salaries';
import Settings from './pages/Settings';
import EmployeeOnboarding from './pages/EmployeeOnboarding';
import OnboardingRequests from './pages/OnboardingRequests';
import MonthlyRevenue from './pages/MonthlyRevenue';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<EmployeeOnboarding />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <Layout>
                  <Employees />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Layout>
                  <Projects />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/salaries"
            element={
              <ProtectedRoute>
                <Layout>
                  <Salaries />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/monthly-revenue"
            element={
              <ProtectedRoute>
                <Layout>
                  <MonthlyRevenue />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding-requests"
            element={
              <ProtectedRoute>
                <Layout>
                  <OnboardingRequests />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Redirect all unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
