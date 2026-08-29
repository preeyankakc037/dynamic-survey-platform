import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function SurveyAnalytics() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Mock data since backend connection is pending
  const surveyTitle = "Student Feedback"
  const summary = {
    totalResponses: 48,
    questions: 8,
    averageRating: 4.4,
    completionRate: 92
  }

  const choiceData = [
    { name: 'Yes', count: 32 },
    { name: 'No', count: 12 },
  ]

  const checkboxData = [
    { name: 'React', count: 35 },
    { name: 'Python', count: 28 },
    { name: 'FastAPI', count: 21 },
    { name: 'Node.js', count: 17 },
  ]

  const ratingData = [
    { name: '5 ★', count: 28 },
    { name: '4 ★', count: 13 },
    { name: '3 ★', count: 4 },
    { name: '2 ★', count: 2 },
    { name: '1 ★', count: 1 },
  ]

  const textResponses = [
    "Really enjoyed the practical examples.",
    "The interface was easy to use.",
    "Would like more advanced exercises.",
    "The pacing was a bit too fast in the second week."
  ]

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4 pb-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{surveyTitle}</h1>
          <p className="text-sm text-text-secondary">Analytics</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalResponses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.questions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageRating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Choice Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Did you enjoy the course?</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={choiceData} layout="vertical" margin={{ left: 0, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rate your experience</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingData} layout="vertical" margin={{ left: 0, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={60} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="#06B6D4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Checkbox Analytics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Technologies used</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checkboxData} layout="vertical" margin={{ left: 0, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="#64748B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Text Analytics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Text Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {textResponses.map((text, i) => (
                <div key={i} className="p-4 rounded-md border border-border bg-background/50">
                  <p className="text-sm text-text-primary">"{text}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
