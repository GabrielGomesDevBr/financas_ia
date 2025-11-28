import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface HelpCardProps {
    data: {
        title: string
        description?: string
        steps?: string[]
        examples?: string[]
        action?: { label: string; url: string }
    }
}

export function HelpCard({ data }: HelpCardProps) {
    return (
        <Card className="mt-3 p-4 bg-indigo-50 border-indigo-100 animate-fade-in">
            <div className="flex items-center gap-2 mb-2 text-indigo-700">
                <Lightbulb className="w-5 h-5" />
                <h4 className="font-semibold">{data.title}</h4>
            </div>

            {data.description && (
                <p className="text-sm text-indigo-900 mb-3">{data.description}</p>
            )}

            {data.steps && (
                <ul className="list-disc list-inside text-sm text-indigo-800 space-y-1 mb-3">
                    {data.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                    ))}
                </ul>
            )}

            {data.examples && (
                <div className="bg-white/60 p-3 rounded-md text-xs text-indigo-900 mb-3 border border-indigo-100">
                    <strong className="block mb-1 text-indigo-700">Tente dizer:</strong>
                    <ul className="space-y-1 italic">
                        {data.examples.map((ex, idx) => <li key={idx}>&quot;{ex}&quot;</li>)}
                    </ul>
                </div>
            )}

            {data.action && (
                <Link href={data.action.url} className="w-full block">
                    <Button variant="outline" size="sm" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 bg-white shadow-sm">
                        {data.action.label} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            )}
        </Card>
    )
}
