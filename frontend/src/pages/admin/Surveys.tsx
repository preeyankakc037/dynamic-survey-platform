import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlusCircle, Search, Edit2, BarChart2, Copy, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { surveyService } from "@/services/surveys"
import { Survey } from "@/types/survey"

function formatDate(iso?: string): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export function Surveys() {
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const loadSurveys = () => {
    setIsLoading(true)
    surveyService.getSurveys()
      .then(setSurveys)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadSurveys()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this survey?")) return
    try {
      await surveyService.deleteSurvey(id)
      setSurveys(surveys.filter(s => s._id !== id))
    } catch (err: any) {
      alert("Failed to delete survey: " + err.message)
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await surveyService.duplicateSurvey(id)
      loadSurveys()
    } catch (err: any) {
      alert("Failed to duplicate survey: " + err.message)
    }
  }

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/s/${id}`
    navigator.clipboard.writeText(url)
    alert("Public link copied to clipboard!")
  }

  const filteredSurveys = surveys.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Surveys</h1>
        <Button onClick={() => navigate("/admin/surveys/new")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Survey
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input 
            placeholder="Search surveys..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-border/50 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-danger text-sm border border-danger/30 bg-danger/5 rounded-md px-4 py-3">
            Failed to load surveys: {error}
          </div>
        )}

        {!isLoading && !error && filteredSurveys.length === 0 && (
          <div className="text-center py-12 text-text-secondary border border-dashed border-border rounded-xl">
            <p className="mb-4">No surveys found.</p>
            {searchQuery ? (
              <Button variant="secondary" onClick={() => setSearchQuery("")}>Clear Search</Button>
            ) : (
              <Button variant="secondary" onClick={() => navigate("/admin/surveys/new")}>Create your first survey</Button>
            )}
          </div>
        )}

        {!isLoading && !error && filteredSurveys.map((survey) => (
          <Card key={survey._id} className="hover:border-primary/40 transition-colors">
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-1 min-w-0 flex-1 pr-4">
                <h3 className="font-semibold text-lg cursor-pointer hover:text-primary truncate" onClick={() => navigate(`/admin/surveys/${survey._id}/edit`)}>
                  {survey.title}
                </h3>
                <p className="text-sm text-text-secondary truncate">
                  {survey.description || "No description"}
                </p>
                <div className="flex items-center gap-4 text-xs text-text-secondary pt-2">
                  <span>{survey.questions.length} questions</span>
                  <span className="text-success font-medium">Published</span>
                  <span>Updated {formatDate(survey.updated_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" title="Preview" onClick={() => navigate(`/admin/surveys/${survey._id}/preview`)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Copy Public Link" onClick={() => handleCopyLink(survey._id!)}>
                  <span className="sr-only">Copy Link</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                </Button>
                <Button variant="ghost" size="icon" title="Edit" onClick={() => navigate(`/admin/surveys/${survey._id}/edit`)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Analytics" onClick={() => navigate(`/admin/surveys/${survey._id}/analytics`)}>
                  <BarChart2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Duplicate" onClick={() => handleDuplicate(survey._id!)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-danger hover:text-danger hover:bg-danger/10" title="Delete" onClick={() => handleDelete(survey._id!)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
