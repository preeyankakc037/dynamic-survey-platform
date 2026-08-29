import { Question } from "@/types/survey"
import { Input } from "@/components/ui/Input"
import { Checkbox } from "@/components/ui/Checkbox"
import { Label } from "@/components/ui/Label"
import { useFormContext } from "react-hook-form"

interface QuestionRendererProps {
  question: Question
  index: number
}

export function QuestionRenderer({ question, index }: QuestionRendererProps) {
  const { register, formState: { errors }, watch, setValue } = useFormContext()
  
  const fieldName = `q_${question.id}`
  const error = errors[fieldName]
  
  const renderInput = () => {
    switch (question.type) {
      case "text":
        return (
          <Input 
            {...register(fieldName)}
            placeholder="Enter your answer..."
            className={error ? "border-danger" : ""}
          />
        )
      case "single_choice":
        return (
          <div className="space-y-3">
            {question.options?.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="radio"
                  id={`${fieldName}_${i}`}
                  value={opt}
                  {...register(fieldName)}
                  className="h-4 w-4 text-primary focus:ring-primary border-border"
                />
                <Label htmlFor={`${fieldName}_${i}`} className="font-normal">{opt}</Label>
              </div>
            ))}
          </div>
        )
      case "checkbox": {
        const currentValue = watch(fieldName) || []
        return (
          <div className="space-y-3">
            {question.options?.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <Checkbox
                  id={`${fieldName}_${i}`}
                  checked={currentValue.includes(opt)}
                  onChange={(e) => {
                    const checked = e.target.checked
                    if (checked) {
                      setValue(fieldName, [...currentValue, opt], { shouldValidate: true })
                    } else {
                      setValue(fieldName, currentValue.filter((v: string) => v !== opt), { shouldValidate: true })
                    }
                  }}
                />
                <Label htmlFor={`${fieldName}_${i}`} className="font-normal">{opt}</Label>
              </div>
            ))}
            {/* hidden input to register field with RHF */}
            <input type="hidden" {...register(fieldName)} />
          </div>
        )
      }
      case "rating":
        const min = question.min || 1
        const max = question.max || 5
        const range = Array.from({ length: max - min + 1 }, (_, i) => min + i)
        return (
          <div className="flex flex-wrap gap-4">
            {range.map((val) => (
              <div key={val} className="flex flex-col items-center gap-2">
                <input
                  type="radio"
                  id={`${fieldName}_${val}`}
                  value={val}
                  {...register(fieldName)}
                  className="h-5 w-5 text-primary focus:ring-primary border-border cursor-pointer"
                />
                <Label htmlFor={`${fieldName}_${val}`} className="font-normal cursor-pointer">{val}</Label>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4 py-4">
      <div>
        <h3 className="text-lg font-medium">
          {index + 1}. {question.label} {question.required && <span className="text-danger">*</span>}
        </h3>
      </div>
      <div>
        {renderInput()}
        {error && <p className="text-danger text-sm mt-2">{error.message as string}</p>}
      </div>
    </div>
  )
}
