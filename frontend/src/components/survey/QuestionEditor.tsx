import { useState } from "react"
import { Question } from "@/types/survey"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Checkbox } from "@/components/ui/Checkbox"
import { Label } from "@/components/ui/Label"
import { ArrowUp, ArrowDown, Copy, Trash2, MoreVertical, Plus, X } from "lucide-react"
import { Select } from "@/components/ui/Select"
import { ConditionEditor } from "./ConditionEditor"

interface QuestionEditorProps {
  question: Question
  index: number
  totalQuestions: number
  availableQuestions: Question[]
  isActive: boolean
  onActivate: () => void
  onUpdate: (updates: Partial<Question>) => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function QuestionEditor({
  question,
  index,
  totalQuestions,
  availableQuestions,
  isActive,
  onActivate,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: QuestionEditorProps) {
  
  const addOption = () => {
    if (!question.options) return
    onUpdate({ options: [...question.options, `Option ${question.options.length + 1}`] })
  }

  const updateOption = (optIndex: number, value: string) => {
    if (!question.options) return
    const newOptions = [...question.options]
    newOptions[optIndex] = value
    onUpdate({ options: newOptions })
  }

  const removeOption = (optIndex: number) => {
    if (!question.options || question.options.length <= 1) return
    const newOptions = [...question.options]
    newOptions.splice(optIndex, 1)
    onUpdate({ options: newOptions })
  }

  return (
    <Card 
      className={`transition-colors cursor-pointer ${isActive ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
      onClick={(e) => {
        // Prevent activation if clicking interactive elements inside
        if ((e.target as HTMLElement).closest('button, input, select')) return;
        onActivate()
      }}
    >
      <CardContent className="p-0">
        <div className="flex">
          {/* Drag Handle / Reorder area */}
          <div className="w-10 flex flex-col items-center py-4 border-r border-border bg-surface/50 rounded-l-xl">
            <span className="text-sm font-medium text-text-secondary mb-2">{index + 1}</span>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={onMoveUp}>
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === totalQuestions - 1} onClick={onMoveDown}>
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-4">
            <div className="flex gap-4">
              <Input
                className={`text-lg font-medium flex-1 ${!isActive && 'border-transparent bg-transparent hover:border-border'}`}
                value={question.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                placeholder="Question Text"
                onFocus={onActivate}
              />
              {isActive && (
                <Select
                  className="w-48"
                  value={question.type}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    // Provide defaults when switching types
                    const updates: Partial<Question> = { type: newType };
                    if ((newType === 'single_choice' || newType === 'checkbox') && !question.options) {
                      updates.options = ['Option 1'];
                    }
                    if (newType === 'rating' && (!question.min || !question.max)) {
                      updates.min = 1;
                      updates.max = 5;
                    }
                    onUpdate(updates);
                  }}
                >
                  <option value="text">Text Input</option>
                  <option value="single_choice">Single Choice</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="rating">Rating</option>
                </Select>
              )}
            </div>

            {/* Editor Body */}
            {isActive && (
              <div className="space-y-4 pt-4 border-t border-border">
                {/* Options for Choice types */}
                {(question.type === 'single_choice' || question.type === 'checkbox') && (
                  <div className="space-y-2">
                    {question.options?.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        {question.type === 'single_choice' ? (
                          <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-sm border border-border shrink-0" />
                        )}
                        <Input
                          value={opt}
                          onChange={(e) => updateOption(optIndex, e.target.value)}
                          className="flex-1 h-8"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-text-secondary hover:text-danger"
                          onClick={() => removeOption(optIndex)}
                          disabled={question.options!.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" className="gap-2 ml-6 text-primary hover:text-primary" onClick={addOption}>
                      <Plus className="h-3 w-3" />
                      Add Option
                    </Button>
                  </div>
                )}

                {/* Rating Config */}
                {question.type === 'rating' && (
                  <div className="flex gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Min</Label>
                      <Input
                        type="number"
                        className="w-20"
                        value={question.min || 1}
                        onChange={(e) => onUpdate({ min: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max</Label>
                      <Input
                        type="number"
                        className="w-20"
                        value={question.max || 5}
                        onChange={(e) => onUpdate({ max: parseInt(e.target.value) || 5 })}
                      />
                    </div>
                  </div>
                )}
                
                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`req-${question.id}`}
                        checked={question.required}
                        onChange={(e) => onUpdate({ required: e.target.checked })}
                      />
                      <Label htmlFor={`req-${question.id}`}>Required</Label>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onDuplicate} title="Duplicate">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onDelete} className="text-danger hover:text-danger hover:bg-danger/10" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Conditional Logic Section */}
                {availableQuestions.length > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <ConditionEditor
                      condition={question.condition || null}
                      availableQuestions={availableQuestions}
                      onChange={(cond) => onUpdate({ condition: cond })}
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Readonly preview when not active */}
            {!isActive && (
              <div className="text-sm text-text-secondary opacity-70">
                {question.type === 'text' && <div>[ Text Input ]</div>}
                {question.type === 'single_choice' && <div>○ {question.options?.[0]} ...</div>}
                {question.type === 'checkbox' && <div>☐ {question.options?.[0]} ...</div>}
                {question.type === 'rating' && <div>Rating scale ({question.min}-{question.max})</div>}
              </div>
            )}

            {/* Conditional Logic Badge */}
            {question.condition && (
              <div className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent mt-2">
                Conditional
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
