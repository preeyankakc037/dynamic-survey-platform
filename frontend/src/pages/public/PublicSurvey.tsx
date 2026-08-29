import { useState, useEffect, useMemo } from "react"
import { useParams } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { QuestionRenderer } from "@/components/survey/QuestionRenderer"
import { Survey, Question } from "@/types/survey"
import { surveyService } from "@/services/surveys"
import { responsesService } from "@/services/responses"

function evaluateCondition(condition: Question['condition'], formValues: any) {
  if (!condition) return true
  // If no value is set on the condition yet, show the question
  if (condition.value === '' || condition.value === null || condition.value === undefined) return true
  const { question_id, operator, value } = condition
  const answer = formValues[`q_${question_id}`]

  if (operator === 'equals') {
    if (Array.isArray(answer)) {
      return answer.includes(String(value))
    }
    return String(answer ?? '') === String(value)
  }
  return true
}

export function PublicSurvey() {
  const { surveyId } = useParams()
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!surveyId) return
    setIsLoading(true)
    surveyService.getSurvey(surveyId)
      .then(setSurvey)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [surveyId])

  const formSchema = useMemo(() => {
    if (!survey) return z.object({})
    const schemaObj: Record<string, any> = {}
    
    survey.questions.forEach((q) => {
      schemaObj[`q_${q.id}`] = z.any()
    })
    
    return z.object(schemaObj).superRefine((data, ctx) => {
      survey.questions.forEach(q => {
        const isVisible = evaluateCondition(q.condition, data)
        if (isVisible && q.required) {
          const val = data[`q_${q.id}`]
          if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: q.type === 'checkbox' ? "Please select at least one option." : "This question is required.",
              path: [`q_${q.id}`]
            })
          }
        }
      })
    })
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

  const onSubmit = async (data: any) => {
    if (!surveyId) return
    setIsSubmitting(true)
    setSubmitError(null)

    // Remove answers for hidden (conditional) questions
    const submitData = { ...data }
    survey?.questions.forEach(q => {
      if (q.condition && !evaluateCondition(q.condition, formValues)) {
        delete submitData[`q_${q.id}`]
      }
    })

    // Transform from { q_q1: "Yes", q_q3: 4 } → { q1: "Yes", q3: 4 }
    const answers: Record<string, string | string[] | number> = {}
    Object.entries(submitData).forEach(([key, value]) => {
      const questionId = key.replace(/^q_/, '')
      // Convert rating string to number
      const question = survey?.questions.find(q => q.id === questionId)
      if (question?.type === 'rating' && typeof value === 'string') {
        answers[questionId] = Number(value)
      } else {
        answers[questionId] = value as string | string[]
      }
    })

    try {
      await responsesService.submitResponse(surveyId, answers)
      setIsSuccess(true)
    } catch (e: any) {
      setSubmitError(e.message || 'Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading survey...</div>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Survey not found</h2>
          <p className="text-text-secondary">{error || 'This survey does not exist or has been removed.'}</p>
        </div>
      </div>
    )
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

            {submitError && (
              <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-md px-4 py-3">
                {submitError}
              </div>
            )}

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
