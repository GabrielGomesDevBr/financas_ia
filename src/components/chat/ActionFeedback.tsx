import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface ActionFeedbackProps {
    action: {
        type: string
        parameters: any
        success: boolean
        result?: any
    }
}

export function ActionFeedback({ action }: ActionFeedbackProps) {
    if (action.type === 'registrar_transacao' && action.success) {
        const { amount, category, description, type } = action.parameters
        const isExpense = type === 'expense'

        return (
            <Card className="mt-2 p-3 bg-green-50 border-green-200 flex flex-col gap-2 animate-fade-in">
                <div className="flex items-center gap-2 text-green-700 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Transação Registada</span>
                </div>

                <div className="flex justify-between items-center bg-white p-2 rounded border border-green-100">
                    <div className="flex flex-col min-w-0 mr-2">
                        <span className="text-xs text-muted-foreground uppercase truncate">{category}</span>
                        <span className="text-sm font-medium truncate">{description}</span>
                    </div>
                    <span className={`font-bold whitespace-nowrap ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                        {isExpense ? '-' : '+'}{formatCurrency(amount)}
                    </span>
                </div>
            </Card>
        )
    }

    if (action.type === 'criar_orcamento' && action.success) {
        const { amount, category, period } = action.parameters
        return (
            <Card className="mt-2 p-3 bg-blue-50 border-blue-200 flex flex-col gap-2 animate-fade-in">
                <div className="flex items-center gap-2 text-blue-700 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Orçamento Criado</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded border border-blue-100">
                    <div className="flex flex-col min-w-0 mr-2">
                        <span className="text-xs text-muted-foreground uppercase truncate">{category}</span>
                        <span className="text-sm font-medium truncate">Período: {period}</span>
                    </div>
                    <span className="font-bold text-blue-600 whitespace-nowrap">
                        {formatCurrency(amount)}
                    </span>
                </div>
            </Card>
        )
    }

    // Fallback para outras ações ou erros
    return null
}
