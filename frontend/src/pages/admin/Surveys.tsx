import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { PlusCircle, Search, Edit2, BarChart2, Copy, Trash2, Eye } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { useNavigate } from "react-router-dom"

export function Surveys() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
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
          <Input placeholder="Search surveys..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4">
        {/* Placeholder survey item */}
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg cursor-pointer hover:text-primary" onClick={() => navigate("/admin/surveys/1/edit")}>
                Student Feedback
              </h3>
              <p className="text-sm text-text-secondary line-clamp-1 max-w-lg">
                Gather feedback from students about the recent course to improve our teaching methodology.
              </p>
              <div className="flex items-center gap-4 text-sm text-text-secondary pt-2">
                <span>12 questions</span>
                <span>48 responses</span>
                <span className="text-success font-medium">Published</span>
                <span>Last updated 2 days ago</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" title="Preview" onClick={() => navigate("/admin/surveys/1/preview")}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Edit" onClick={() => navigate("/admin/surveys/1/edit")}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Analytics" onClick={() => navigate("/admin/surveys/1/analytics")}>
                <BarChart2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Duplicate">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-danger hover:text-danger hover:bg-danger/10" title="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
