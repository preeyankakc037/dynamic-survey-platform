import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Dashboard } from '@/pages/admin/Dashboard';
import { Surveys } from '@/pages/admin/Surveys';
import { SurveyBuilder } from '@/pages/admin/SurveyBuilder';
import { SurveyPreview } from '@/pages/admin/SurveyPreview';
import { SurveyAnalytics } from '@/pages/admin/SurveyAnalytics';
import { PublicHome } from '@/pages/public/PublicHome';
import { PublicSurvey } from '@/pages/public/PublicSurvey';
import { NotFound } from '@/pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public: Survey listing home — no login required */}
          <Route path="/" element={<PublicHome />} />

          {/* Public: Take a specific survey — no login required */}
          <Route path="/s/:surveyId" element={<PublicSurvey />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="surveys" element={<Surveys />} />
              <Route path="surveys/new" element={<SurveyBuilder />} />
              <Route path="surveys/:id/edit" element={<SurveyBuilder />} />
              <Route path="surveys/:id/analytics" element={<SurveyAnalytics />} />
            </Route>
            {/* Preview doesn't need the sidebar layout */}
            <Route path="surveys/:id/preview" element={<SurveyPreview />} />
          </Route>

          {/* 404 — catch all unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
