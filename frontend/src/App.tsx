import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Dashboard } from '@/pages/admin/Dashboard';
import { Surveys } from '@/pages/admin/Surveys';
import { SurveyBuilder } from '@/pages/admin/SurveyBuilder';
import { SurveyPreview } from '@/pages/admin/SurveyPreview';
import { SurveyAnalytics } from '@/pages/admin/SurveyAnalytics';
import { PublicSurvey } from '@/pages/public/PublicSurvey';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Public Routes */}
        <Route path="/s/:surveyId" element={<PublicSurvey />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="surveys" element={<Surveys />} />
          <Route path="surveys/new" element={<SurveyBuilder />} />
          <Route path="surveys/:id/edit" element={<SurveyBuilder />} />
          <Route path="surveys/:id/analytics" element={<SurveyAnalytics />} />
        </Route>
        <Route path="/admin/surveys/:id/preview" element={<SurveyPreview />} />
      </Routes>
    </Router>
  );
}

export default App;
