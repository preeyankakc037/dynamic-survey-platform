import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BarChart2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { surveyService } from '@/services/surveys';
import { Survey } from '@/types/survey';
import { useAuth } from '@/context/AuthContext';

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [totalResponses, setTotalResponses] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      surveyService.getSurveys(),
      import('@/services/analytics').then(m => m.analyticsService.getGlobalSummary())
    ])
      .then(([surveysData, summaryData]) => {
        setSurveys(surveysData);
        setTotalResponses(summaryData.total_responses);
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const totalSurveys = surveys.length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            {greeting()}{user ? `, ${user.username}` : ''}.
          </h1>
          <p className="text-text-secondary text-sm mt-1">Here's what's happening with your surveys.</p>
        </div>
        <Button onClick={() => navigate('/admin/surveys/new')} className="gap-2 shrink-0">
          <PlusCircle className="h-4 w-4" />
          Create Survey
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">
              {isLoading ? '—' : totalSurveys}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">
              {isLoading ? '—' : (totalResponses ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent surveys */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-text-primary">Recent Surveys</h2>

        {isLoading && (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-border/50 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-danger text-sm border border-danger/30 bg-danger/5 rounded-md px-4 py-3">
            Failed to load surveys: {error}
          </div>
        )}

        {!isLoading && !error && surveys.length === 0 && (
          <div className="text-center py-10 text-text-secondary border border-dashed border-border rounded-xl">
            <p className="mb-3">No surveys yet.</p>
            <Button variant="secondary" onClick={() => navigate('/admin/surveys/new')}>
              Create your first survey
            </Button>
          </div>
        )}

        {!isLoading && !error && surveys.slice(0, 5).map((s) => (
          <Card key={s._id} className="hover:border-primary/40 transition-colors">
            <CardContent className="flex items-center justify-between p-5">
              <div className="min-w-0">
                <h3 className="font-medium text-text-primary truncate">{s.title}</h3>
                <p className="text-xs text-text-secondary mt-0.5 truncate max-w-sm">{s.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                  <span>{s.questions.length} question{s.questions.length !== 1 ? 's' : ''}</span>
                  <span>Updated {formatDate(s.updated_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-4 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Edit"
                  onClick={() => navigate(`/admin/surveys/${s._id}/edit`)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Analytics"
                  onClick={() => navigate(`/admin/surveys/${s._id}/analytics`)}
                >
                  <BarChart2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
