import { Condition, Question } from "@/types/survey"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { Input } from "@/components/ui/Input"
import { Trash2 } from "lucide-react"

interface ConditionEditorProps {
  condition: Condition | null
  availableQuestions: Question[]
  onChange: (condition: Condition | null) => void
}

export function ConditionEditor({ condition, availableQuestions, onChange }: ConditionEditorProps) {
  if (!condition) {
    return (
      <Button variant="ghost" size="sm" className="text-accent hover:text-accent hover:bg-accent/10" onClick={() => onChange({
        question_id: availableQuestions[0]?.id || "",
        operator: "equals",
        value: ""
      })}>
        + Add Condition
      </Button>
    )
  }

  const selectedQuestion = availableQuestions.find(q => q.id === condition.question_id)

  return (
    <div className="flex items-center gap-2 p-3 bg-accent/5 rounded-md border border-accent/20">
      <span className="text-sm text-text-secondary whitespace-nowrap">Show if</span>
      
      <Select
        className="w-48 h-8 text-xs"
        value={condition.question_id}
        onChange={(e) => onChange({ ...condition, question_id: e.target.value })}
      >
        {availableQuestions.map((q, idx) => (
          <option key={q.id} value={q.id}>
            Q{idx + 1}: {q.label.substring(0, 20)}{q.label.length > 20 ? '...' : ''}
          </option>
        ))}
      </Select>

      <span className="text-sm text-text-secondary">is</span>

      {selectedQuestion?.type === "single_choice" || selectedQuestion?.type === "checkbox" ? (
        <Select
          className="w-32 h-8 text-xs"
          value={condition.value as string}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
        >
          <option value="">Select option</option>
          {selectedQuestion.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
      ) : (
        <Input
          className="w-32 h-8 text-xs"
          value={condition.value as string}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          placeholder="Value"
        />
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-danger hover:text-danger hover:bg-danger/10 ml-auto"
        onClick={() => onChange(null)}
        title="Remove condition"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
