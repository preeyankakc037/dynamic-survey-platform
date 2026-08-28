import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Dashboard } from '@/pages/admin/Dashboard';
import { Surveys } from '@/pages/admin/Surveys';
import { SurveyBuilder } from '@/pages/admin/SurveyBuilder';
import { SurveyPreview } from '@/pages/admin/SurveyPreview';
import { SurveyAnalytics } from '@/pages/admin/SurveyAnalytics';
import { PublicSurvey } from '@/pages/public/PublicSurvey';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          {/* Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Public Routes */}
          <Route path="/s/:surveyId" element={<PublicSurvey />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="surveys" element={<Surveys />} />
              <Route path="surveys/new" element={<SurveyBuilder />} />
              <Route path="surveys/:id/edit" element={<SurveyBuilder />} />
              <Route path="surveys/:id/analytics" element={<SurveyAnalytics />} />
            </Route>
            {/* Preview often doesn't need the sidebar layout */}
            <Route path="surveys/:id/preview" element={<SurveyPreview />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
