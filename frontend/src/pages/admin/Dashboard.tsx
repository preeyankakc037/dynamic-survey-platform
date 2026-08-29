import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { PlusCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Dashboard</h1>
        <Button onClick={() => navigate("/admin/surveys/new")} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create Survey
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">845</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Published Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">Draft Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Surveys</h2>
        <div className="grid gap-4">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/admin/surveys/1/edit")}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold text-lg mb-1">Student Feedback</h3>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span>12 questions</span>
                  <span>48 responses</span>
                  <span className="text-success font-medium">Published</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate("/admin/surveys/2/edit")}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold text-lg mb-1">Course Evaluation</h3>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span>8 questions</span>
                  <span>23 responses</span>
                  <span className="text-warning font-medium">Draft</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
