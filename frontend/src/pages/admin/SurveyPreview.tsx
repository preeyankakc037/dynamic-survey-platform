import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { QuestionRenderer } from "@/components/survey/QuestionRenderer"
import { surveyService } from "@/services/surveys"
import { Survey, Question } from "@/types/survey"

function evaluateCondition(condition: Question['condition'], formValues: any) {
  if (!condition) return true
  const { question_id, operator, value } = condition
  const answer = formValues[`q_${question_id}`]
  
  if (operator === 'equals') {
    if (Array.isArray(answer)) {
      return answer.includes(value)
    }
    return String(answer) === String(value)
  }
  return true
}

export function SurveyPreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (id && id !== 'new') {
      surveyService.getSurvey(id)
        .then(setSurvey)
        .catch((e) => setError(e.message))
        .finally(() => setIsLoading(false))
    } else {
      setError("Please save the survey before previewing.")
      setIsLoading(false)
    }
  }, [id])

  const formSchema = useMemo(() => {
    if (!survey) return z.object({})
    const schemaObj: Record<string, any> = {}
    survey.questions.forEach((q) => {
      let fieldSchema: any
      switch (q.type) {
        case "text":
          fieldSchema = z.string()
          if (q.required) fieldSchema = fieldSchema.min(1, "This question is required.")
          else fieldSchema = fieldSchema.optional()
          break
        case "single_choice":
        case "rating":
          fieldSchema = z.string()
          if (q.required) fieldSchema = fieldSchema.min(1, "This question is required.")
          else fieldSchema = fieldSchema.optional()
          break
        case "checkbox":
          fieldSchema = z.array(z.string())
          if (q.required) fieldSchema = fieldSchema.min(1, "Please select at least one option.")
          else fieldSchema = fieldSchema.optional()
          break
      }
      schemaObj[`q_${q.id}`] = fieldSchema
    })
    return z.object(schemaObj)
  }, [survey])

  const methods = useForm({
    resolver: zodResolver(formSchema),
  })

  const { handleSubmit, watch, setValue, formState: { errors } } = methods
  const formValues = watch()

  // Handle conditional logic cleanup (if question becomes hidden, clear its value)
  useEffect(() => {
    survey.questions.forEach((q) => {
      if (q.condition) {
        const isVisible = evaluateCondition(q.condition, formValues)
        if (!isVisible) {
          const currentValue = formValues[`q_${q.id}`]
          const isCheckbox = q.type === 'checkbox'
          const emptyVal = isCheckbox ? [] : ''
          if (JSON.stringify(currentValue) !== JSON.stringify(emptyVal)) {
            setValue(`q_${q.id}`, emptyVal, { shouldValidate: false })
          }
        }
      }
    })
  }, [formValues, survey.questions, setValue])

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    // Filter out hidden questions before submission
    const submitData = { ...data }
    survey.questions.forEach(q => {
      if (q.condition && !evaluateCondition(q.condition, formValues)) {
        delete submitData[`q_${q.id}`]
      }
    })
    
    console.log("Submitting:", submitData)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 1000)
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <CheckCircle2 className="h-16 w-16 text-success" />
        <h2 className="text-2xl font-semibold">Response submitted</h2>
        <p className="text-text-secondary text-center max-w-sm">
          Thank you for completing the survey. Your response has been recorded.
        </p>
        <Button onClick={() => navigate(-1)} variant="secondary">Return</Button>
      </div>
    )
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-text-secondary">Loading preview...</div>
  }

  if (error || !survey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-danger/10 text-danger p-4 rounded-xl max-w-md w-full text-center mb-4">
          {error || "Survey not found"}
        </div>
        <Button onClick={() => navigate("/admin/surveys")} variant="secondary">Back to Surveys</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar for Preview Mode */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/surveys/${survey._id}/edit`)} className="text-text-secondary">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Editor
          </Button>
          <div className="h-4 w-px bg-border mx-2" />
          <span className="text-sm font-medium text-text-primary">Preview Mode</span>
        </div>
        <div className="text-xs font-medium bg-warning/20 text-warning-700 px-2 py-1 rounded-full border border-warning/30">
          Responses are not saved
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-6">
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-primary/5 border-b border-border p-8">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-3">
              {survey.title}
            </h1>
            {survey.description && (
              <p className="text-text-secondary text-lg leading-relaxed">
                {survey.description}
              </p>
            )}
          </div>

          {/* Body */}
          <div className="p-8">
            {isSuccess ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-6">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-3">Thank you!</h2>
                <p className="text-text-secondary mb-8 max-w-md mx-auto">
                  Your response has been recorded. This was just a preview, so no data was actually saved.
                </p>
                <Button onClick={() => {
                  methods.reset()
                  setIsSuccess(false)
                }}>
                  Submit another response
                </Button>
              </div>
            ) : (
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {survey.questions.map((q, index) => {
                    // Check conditional logic
                    const shouldShow = evaluateCondition(q.condition, formValues)
                    if (!shouldShow) return null

                    return (
                      <div key={q.id} className="bg-surface rounded-xl p-6 border border-border shadow-sm">
                        <QuestionRenderer question={q} index={index} />
                      </div>
                    )
                  })}

                  <div className="pt-6 border-t border-border flex justify-end">
                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                      {isSubmitting ? "Submitting..." : "Submit Survey"}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
