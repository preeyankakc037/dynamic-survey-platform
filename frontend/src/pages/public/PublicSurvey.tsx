import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { QuestionRenderer } from "@/components/survey/QuestionRenderer"
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

export function PublicSurvey() {
  const { surveyId } = useParams()
  // Mock data for public survey
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // Mock API fetch
    setTimeout(() => {
      setSurvey({
        title: "Student Feedback",
        description: "Help us improve our course.",
        questions: [
          { id: "q1", type: "text", label: "What is your name?", required: true },
          { id: "q2", type: "single_choice", label: "Did you enjoy the course?", required: true, options: ["Yes", "No"] },
          { id: "q3", type: "text", label: "What did you enjoy most?", required: false, condition: { question_id: "q2", operator: "equals", value: "Yes" } },
          { id: "q4", type: "rating", label: "Rate the course", required: true, min: 1, max: 5 },
        ]
      })
      setIsLoading(false)
    }, 500)
  }, [surveyId])

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

  const { handleSubmit, watch, setValue } = methods
  const formValues = watch()

  useEffect(() => {
    if (!survey) return
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
  }, [formValues, survey?.questions, setValue])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading survey...</div>
  }

  if (!survey) {
    return <div className="min-h-screen flex items-center justify-center">Survey not found.</div>
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <CheckCircle2 className="h-16 w-16 text-success mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Response submitted</h2>
        <p className="text-text-secondary text-center max-w-sm mb-6">
          Thank you for completing the survey. Your response has been recorded.
        </p>
      </div>
    )
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    const submitData = { ...data }
    survey.questions.forEach(q => {
      if (q.condition && !evaluateCondition(q.condition, formValues)) {
        delete submitData[`q_${q.id}`]
      }
    })
    
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-8 border-b border-border bg-slate-50/50">
          <h1 className="text-3xl font-bold text-text-primary mb-2">{survey.title}</h1>
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
    </div>
  )
}
