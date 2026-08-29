import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, ArrowRight, Search } from 'lucide-react'
import { surveyService } from '@/services/surveys'
import { Survey } from '@/types/survey'

export function PublicHome() {
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    surveyService.getSurveys()
      .then(setSurveys)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = surveys.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-text-primary">Survey Platform</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-text-secondary hover:text-primary transition-colors"
          >
            Admin Login →
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-text-primary mb-3">Available Surveys</h1>
          <p className="text-text-secondary text-lg">Select a survey below to share your feedback.</p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search surveys..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-border/40 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-10 text-danger border border-danger/30 bg-danger/5 rounded-xl">
            Failed to load surveys: {error}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-text-secondary">
            {search ? 'No surveys match your search.' : 'No surveys are available yet.'}
          </div>
        )}

        {/* Survey cards */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {filtered.map((survey) => (
              <button
                key={survey._id}
                onClick={() => navigate(`/s/${survey._id}`)}
                className="w-full text-left bg-surface border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                      {survey.title}
                    </h2>
                    {survey.description && (
                      <p className="text-text-secondary text-sm mt-1 line-clamp-2">{survey.description}</p>
                    )}
                    <p className="text-xs text-text-secondary mt-2">
                      {survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-text-secondary group-hover:text-primary shrink-0 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
