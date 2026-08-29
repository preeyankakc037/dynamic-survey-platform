import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Users, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { apiClient } from "@/services/api/client"
import { surveyService } from "@/services/surveys"
import { Survey } from "@/types/survey"

interface Answer {
  question_id: string
  value: string | string[] | number
}

interface Response {
  _id: string
  survey_id: string
  answers: Answer[]
  submitted_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  })
}

function formatValue(value: string | string[] | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—"
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—"
  return String(value)
}

export function SurveyResponses() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [responses, setResponses] = useState<Response[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    Promise.all([
      surveyService.getSurvey(id),
      apiClient.get(`/surveys/${id}/responses`)
    ])
      .then(([surveyData, responsesData]) => {
        setSurvey(surveyData as Survey)
        setResponses(responsesData as Response[])
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 rounded-lg bg-border/40 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-border/40 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="bg-danger/10 text-danger px-4 py-3 rounded-xl text-sm border border-danger/30">
          {error}
        </div>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  const questionMap: Record<string, string> = {}
  survey?.questions.forEach((q) => { questionMap[q.id] = q.label })

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <header className="flex items-center gap-4 pb-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight truncate">
            {survey?.title}
          </h1>
          <p className="text-sm text-text-secondary">Individual Responses</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 bg-surface border border-border rounded-lg px-3 py-1.5">
          <Users className="h-4 w-4 text-text-secondary" />
          <span className="text-sm font-semibold text-text-primary">{responses.length}</span>
          <span className="text-xs text-text-secondary">responses</span>
        </div>
      </header>

      {responses.length === 0 ? (
        <div className="text-center py-16 text-text-secondary border border-dashed border-border rounded-xl">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">No responses yet</p>
          <p className="text-sm">Share the survey link to start collecting responses.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {responses.map((response, idx) => {
            const isExpanded = expandedId === response._id
            return (
              <Card key={response._id} className="overflow-hidden transition-colors hover:border-primary/30">
                <CardHeader
                  className="cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : response._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                        {responses.length - idx}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-text-primary">
                          Response #{responses.length - idx}
                        </CardTitle>
                        <p className="text-xs text-text-secondary">{formatDate(response.submitted_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-secondary">{response.answers.filter(a => a.value !== null && a.value !== "" && !(Array.isArray(a.value) && a.value.length === 0)).length} answers</span>
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4 text-text-secondary" />
                        : <ChevronDown className="h-4 w-4 text-text-secondary" />
                      }
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4">
                    <div className="border-t border-border pt-4 space-y-3">
                      {survey?.questions.map((q) => {
                        const ans = response.answers.find((a) => a.question_id === q.id)
                        const val = ans?.value
                        const isEmpty = val === null || val === undefined || val === "" || (Array.isArray(val) && val.length === 0)
                        return (
                          <div key={q.id} className="grid grid-cols-[1fr_1.5fr] gap-4 py-2 border-b border-border/50 last:border-0">
                            <div>
                              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-0.5">
                                {q.type.replace("_", " ")}
                              </p>
                              <p className="text-sm text-text-primary">{q.label}</p>
                            </div>
                            <div className="flex items-center">
                              {isEmpty ? (
                                <span className="text-sm text-text-secondary italic">Not answered</span>
                              ) : (
                                <span className="text-sm text-text-primary font-medium">
                                  {formatValue(val)}
                                  {q.type === "rating" && " ★"}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
