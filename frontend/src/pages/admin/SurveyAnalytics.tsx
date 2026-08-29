import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Users, Star, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { analyticsService, SurveyAnalyticsData } from "@/services/analytics"

export function SurveyAnalytics() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState<SurveyAnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    analyticsService
      .getAnalytics(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded-lg bg-border/40 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-border/40 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-border/40 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="bg-danger/10 text-danger px-4 py-3 rounded-xl text-sm border border-danger/30">
          {error || "Failed to load analytics."}
        </div>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <header className="flex items-center gap-4 pb-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{data.title}</h1>
          <p className="text-sm text-text-secondary">Analytics Dashboard</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">{data.total_responses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-text-secondary">Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">{data.question_count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-text-secondary">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text-primary">
              {data.average_rating != null ? `${data.average_rating} / 5` : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-question results */}
      {data.total_responses === 0 ? (
        <div className="text-center py-16 text-text-secondary border border-dashed border-border rounded-xl">
          <p className="text-lg font-medium mb-2">No responses yet</p>
          <p className="text-sm">Share the public survey link to start collecting responses.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {data.per_question.map((q) => (
            <Card
              key={q.question_id}
              className={q.type === "text" || (q.choice_counts && q.choice_counts.length > 4) ? "lg:col-span-2" : ""}
            >
              <CardHeader>
                <CardTitle className="text-base font-semibold text-text-primary">{q.label}</CardTitle>
                <p className="text-xs text-text-secondary capitalize">{q.type.replace("_", " ")}</p>
              </CardHeader>
              <CardContent>
                {/* single_choice / checkbox — bar chart */}
                {(q.type === "single_choice" || q.type === "checkbox") && q.choice_counts && (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={q.choice_counts} layout="vertical" margin={{ left: 0, right: 30 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: "transparent" }} formatter={(v) => [`${v} responses`, "Count"]} />
                        <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* rating — average + distribution */}
                {q.type === "rating" && (
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-text-primary">{q.average ?? "—"}</span>
                      <span className="text-text-secondary text-sm">/ 5 avg ({q.distribution?.reduce((s, d) => s + d.count, 0) ?? 0} ratings)</span>
                    </div>
                    {q.distribution && q.distribution.length > 0 && (
                      <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={q.distribution} layout="vertical" margin={{ left: 0, right: 30 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={50} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <Tooltip cursor={{ fill: "transparent" }} formatter={(v) => [`${v} ratings`, "Count"]} />
                            <Bar dataKey="count" fill="#06B6D4" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {/* text — list view */}
                {q.type === "text" && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {q.text_responses && q.text_responses.length > 0 ? (
                      q.text_responses.map((text, i) => (
                        <div key={i} className="p-3 rounded-lg border border-border bg-background/50">
                          <p className="text-sm text-text-primary">"{text}"</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-text-secondary text-sm">No text responses yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
