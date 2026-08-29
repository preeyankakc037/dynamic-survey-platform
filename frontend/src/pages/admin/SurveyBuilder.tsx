import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Plus, Save, Play } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { useSurveyBuilder } from "@/hooks/useSurveyBuilder"
import { QuestionType } from "@/types/survey"
import { QuestionEditor } from "@/components/survey/QuestionEditor"
import { surveyService } from "@/services/surveys"

export function SurveyBuilder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isNew = !id || id === 'new'

  const {
    survey,
    updateMetadata,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
    setSurvey,
  } = useSurveyBuilder()

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isNew && id) {
      setIsLoading(true)
      surveyService.getSurvey(id)
        .then((data) => {
          setSurvey(data)
        })
        .catch((err) => {
          setError(err.message)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [id, isNew, setSurvey])

  const handleSave = async () => {
    if (!survey.title.trim()) {
      alert("Survey title is required")
      return
    }

    setIsSaving(true)
    try {
      if (isNew) {
        const newSurvey = await surveyService.createSurvey({
          title: survey.title,
          description: survey.description,
          questions: survey.questions
        })
        navigate(`/admin/surveys/${newSurvey._id}/edit`, { replace: true })
      } else {
        await surveyService.updateSurvey(survey._id!, {
          title: survey.title,
          description: survey.description,
          questions: survey.questions
        })
        alert("Survey saved successfully!")
      }
    } catch (err: any) {
      alert("Failed to save survey: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const questionTypes: { label: string; type: QuestionType }[] = [
    { label: "Text Input", type: "text" },
    { label: "Single Choice", type: "single_choice" },
    { label: "Checkbox", type: "checkbox" },
    { label: "Rating", type: "rating" },
  ]

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-text-secondary">Loading survey...</div>
  }

  if (error) {
    return <div className="p-8 text-danger">Error: {error}</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-8">
      {/* Topbar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/surveys")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="font-semibold">{survey.title || "Untitled Survey"}</div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              if (isNew || !survey._id) {
                alert("Please save the survey before previewing.")
                return
              }
              navigate(`/admin/surveys/${survey._id}/preview`)
            }}
          >
            <Play className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Survey"}
          </Button>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Palette */}
        <aside className="w-64 border-r border-border bg-surface p-4 flex flex-col gap-2 overflow-y-auto">
          <h3 className="font-semibold text-sm text-text-secondary uppercase tracking-wider mb-2">Question Palette</h3>
          {questionTypes.map((qt) => (
            <Button
              key={qt.type}
              variant="secondary"
              className="justify-start gap-2 h-10"
              onClick={() => addQuestion(qt.type)}
            >
              <Plus className="h-4 w-4" />
              {qt.label}
            </Button>
          ))}
        </aside>

        {/* Builder Canvas */}
        <main className="flex-1 overflow-y-auto p-8 bg-background">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Metadata Editor */}
            <div className="bg-surface border border-border p-6 rounded-xl shadow-sm space-y-4">
              <div>
                <Input
                  className="text-2xl font-semibold border-transparent px-0 focus-visible:ring-0 shadow-none h-auto py-1 placeholder:text-text-secondary/50"
                  placeholder="Survey Title"
                  value={survey.title}
                  onChange={(e) => updateMetadata(e.target.value, survey.description)}
                />
              </div>
              <div>
                <Textarea
                  className="border-transparent px-0 focus-visible:ring-0 shadow-none resize-none min-h-[40px] placeholder:text-text-secondary/50"
                  placeholder="Survey Description (optional)"
                  value={survey.description}
                  onChange={(e) => updateMetadata(survey.title, e.target.value)}
                />
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {survey.questions.map((q, index) => (
                <QuestionEditor
                  key={q.id}
                  question={q}
                  index={index}
                  totalQuestions={survey.questions.length}
                  availableQuestions={survey.questions.slice(0, index)}
                  isActive={activeQuestionId === q.id}
                  onActivate={() => setActiveQuestionId(q.id)}
                  onUpdate={(updates) => updateQuestion(q.id, updates)}
                  onDelete={() => deleteQuestion(q.id)}
                  onDuplicate={() => duplicateQuestion(q.id)}
                  onMoveUp={() => reorderQuestions(index, index - 1)}
                  onMoveDown={() => reorderQuestions(index, index + 1)}
                />
              ))}
            </div>

            {survey.questions.length === 0 && (
              <div className="text-center py-12 text-text-secondary">
                <p>No questions yet.</p>
                <p className="text-sm">Click a question type from the palette to get started.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
