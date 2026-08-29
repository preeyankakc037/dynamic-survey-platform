import { Condition, Question } from "@/types/survey"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { Trash2 } from "lucide-react"

interface ConditionEditorProps {
  condition: Condition | null
  availableQuestions: Question[]
  onChange: (condition: Condition | null) => void
}

export function ConditionEditor({ condition, availableQuestions, onChange }: ConditionEditorProps) {
  if (!condition) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-accent hover:text-accent hover:bg-accent/10"
        onClick={() => onChange({
          question_id: availableQuestions[0]?.id || "",
          operator: "equals",
          value: availableQuestions[0]?.options?.[0] ?? (availableQuestions[0]?.min ?? 1)
        })}
      >
        + Add Condition
      </Button>
    )
  }

  const selectedQuestion = availableQuestions.find(q => q.id === condition.question_id)

  // Build value options based on selected question type
  const renderValueSelector = () => {
    if (!selectedQuestion) return null

    if (selectedQuestion.type === "single_choice" || selectedQuestion.type === "checkbox") {
      return (
        <Select
          className="flex-1 min-w-[120px] h-8 text-xs"
          value={condition.value as string}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
        >
          <option value="">Select option…</option>
          {selectedQuestion.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
      )
    }

    if (selectedQuestion.type === "rating") {
      const min = selectedQuestion.min ?? 1
      const max = selectedQuestion.max ?? 5
      const range = Array.from({ length: max - min + 1 }, (_, i) => min + i)
      return (
        <Select
          className="flex-1 min-w-[100px] h-8 text-xs"
          value={String(condition.value)}
          onChange={(e) => onChange({ ...condition, value: Number(e.target.value) })}
        >
          <option value="">Pick rating…</option>
          {range.map((v) => (
            <option key={v} value={v}>{v} ★</option>
          ))}
        </Select>
      )
    }

    return null
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-text-secondary italic">
        Show this question only when a previous answer matches:
      </p>
      <div className="flex flex-wrap items-center gap-2 p-3 bg-accent/5 rounded-md border border-accent/20">
        <span className="text-sm text-text-secondary whitespace-nowrap">Show if</span>

        <Select
          className="flex-1 min-w-[140px] h-8 text-xs"
          value={condition.question_id}
          onChange={(e) => {
            const newQ = availableQuestions.find(q => q.id === e.target.value)
            // Reset value to first valid option when question changes
            const defaultValue = newQ?.type === 'rating'
              ? (newQ.min ?? 1)
              : (newQ?.options?.[0] ?? '')
            onChange({ ...condition, question_id: e.target.value, value: defaultValue })
          }}
        >
          {availableQuestions.map((q, idx) => (
            <option key={q.id} value={q.id} title={q.label}>
              Q{idx + 1}: {q.label.length > 25 ? q.label.substring(0, 25) + '…' : q.label}
            </option>
          ))}
        </Select>

        <span className="text-sm text-text-secondary">equals</span>

        {renderValueSelector()}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-danger hover:text-danger hover:bg-danger/10 shrink-0"
          onClick={() => onChange(null)}
          title="Remove condition"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
