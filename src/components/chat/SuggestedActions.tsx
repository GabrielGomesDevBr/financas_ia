import { Button } from '@/components/ui/button'

interface SuggestedActionsProps {
  onSelect: (action: string) => void
  disabled?: boolean
}

const suggestions = [
  "Quanto gastei este mês?",
  "Mostrar meu orçamento",
  "Criar uma meta de R$ 5.000",
  "Gastos com alimentação",
]

export function SuggestedActions({ onSelect, disabled }: SuggestedActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <p className="text-sm text-muted-foreground w-full mb-1">Sugestões:</p>
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="text-xs"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  )
}
