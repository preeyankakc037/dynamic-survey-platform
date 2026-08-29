import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { QuestionRenderer } from "@/components/survey/QuestionRenderer"
import { useSurveyBuilder } from "@/hooks/useSurveyBuilder"
import { Survey, Question } from "@/types/survey"

// A hook to evaluate conditional logic
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
  const navigate = useNavigate()
  // Mock data for preview if not connected to a global state/API yet
  const { survey } = useSurveyBuilder() // For now, in a real app you'd fetch the survey by ID or pass it via context if previewing draft
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Dynamically build Zod schema
  const formSchema = useMemo(() => {
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
    defaultValues: survey.questions.reduce((acc, q) => {
      acc[`q_${q.id}`] = q.type === 'checkbox' ? [] : ''
      return acc
    }, {} as Record<string, any>)
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-warning bg-warning/10 px-6">
        <div className="flex items-center gap-2 text-warning-dark font-semibold">
          Preview Mode
        </div>
        <Button variant="secondary" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Builder
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto bg-background py-12 px-4">
        <div className="max-w-3xl mx-auto bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-8 border-b border-border bg-slate-50/50">
            <h1 className="text-3xl font-bold text-text-primary mb-2">{survey.title || "Untitled Survey"}</h1>
            {survey.description && (
              <p className="text-text-secondary whitespace-pre-wrap">{survey.description}</p>
            )}
          </div>
          
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
              {survey.questions.map((q, index) => {
                const isVisible = evaluateCondition(q.condition, formValues)
                if (!isVisible) return null

                return (
                  <div key={q.id} className="pb-8 border-b border-border last:border-0 last:pb-0">
                    <QuestionRenderer question={q} index={index} />
                  </div>
                )
              })}

              <div className="pt-4">
                <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
                  {isSubmitting ? "Submitting..." : "Submit Response"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </main>
    </div>
  )
}
