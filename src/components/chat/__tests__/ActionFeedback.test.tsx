import { render, screen } from '@testing-library/react'
import { ActionFeedback } from '../ActionFeedback'
import { describe, it, expect } from 'vitest'

describe('ActionFeedback', () => {
    describe('Transaction Registration', () => {
        it('renders expense transaction feedback correctly', () => {
            const action = {
                type: 'registrar_transacao',
                success: true,
                parameters: {
                    amount: 50,
                    category: 'Alimentação',
                    description: 'Almoço',
                    type: 'expense'
                }
            }

            const { container } = render(<ActionFeedback action={action} />)

            expect(screen.getByText('Transação Registada')).toBeInTheDocument()
            expect(screen.getByText('Alimentação')).toBeInTheDocument()
            expect(screen.getByText('Almoço')).toBeInTheDocument()
            expect(screen.getByText('-R$ 50,00')).toBeInTheDocument()
            expect(screen.getByText('-R$ 50,00')).toHaveClass('text-red-600')

            // Check for success styling
            const card = container.querySelector('.bg-green-50')
            expect(card).toBeInTheDocument()
        })

        it('renders income transaction feedback correctly', () => {
            const action = {
                type: 'registrar_transacao',
                success: true,
                parameters: {
                    amount: 1000,
                    category: 'Salário',
                    description: 'Pagamento',
                    type: 'income'
                }
            }

            render(<ActionFeedback action={action} />)

            expect(screen.getByText('Transação Registada')).toBeInTheDocument()
            expect(screen.getByText('Salário')).toBeInTheDocument()
            expect(screen.getByText('Pagamento')).toBeInTheDocument()
            expect(screen.getByText('+R$ 1.000,00')).toBeInTheDocument()
            expect(screen.getByText('+R$ 1.000,00')).toHaveClass('text-green-600')
        })

        it('formats large amounts correctly', () => {
            const action = {
                type: 'registrar_transacao',
                success: true,
                parameters: {
                    amount: 123456.78,
                    category: 'Investimento',
                    description: 'Aplicação',
                    type: 'expense'
                }
            }

            render(<ActionFeedback action={action} />)

            expect(screen.getByText('-R$ 123.456,78')).toBeInTheDocument()
        })

        it('formats decimal amounts correctly', () => {
            const action = {
                type: 'registrar_transacao',
                success: true,
                parameters: {
                    amount: 9.99,
                    category: 'Diversos',
                    description: 'Item pequeno',
                    type: 'expense'
                }
            }

            render(<ActionFeedback action={action} />)

            expect(screen.getByText('-R$ 9,99')).toBeInTheDocument()
        })

        it('shows check icon for successful transaction', () => {
            const action = {
                type: 'registrar_transacao',
                success: true,
                parameters: {
                    amount: 50,
                    category: 'Test',
                    description: 'Test',
                    type: 'expense'
                }
            }

            const { container } = render(<ActionFeedback action={action} />)
            // CheckCircle2 icon is rendered
            const checkIcon = container.querySelector('svg')
            expect(checkIcon).toBeInTheDocument()
        })

        it('handles long category names with truncation', () => {
            const action = {
                type: 'registrar_transacao',
                success: true,
                parameters: {
                    amount: 50,
                    category: 'Esta é uma categoria com um nome muito longo que deveria ser truncado',
                    description: 'Test',
                    type: 'expense'
                }
            }

            const { container } = render(<ActionFeedback action={action} />)
            const categoryElement = container.querySelector('.truncate')
            expect(categoryElement).toBeInTheDocument()
        })

        it('handles long descriptions with truncation', () => {
            const action = {
                type: 'registrar_transacao',
                success: true,
                parameters: {
                    amount: 50,
                    category: 'Test',
                    description: 'Esta é uma descrição muito longa que deveria ser truncada para não quebrar o layout',
                    type: 'expense'
                }
            }

            const { container } = render(<ActionFeedback action={action} />)
            const descriptionElements = container.querySelectorAll('.truncate')
            expect(descriptionElements.length).toBeGreaterThan(0)
        })

        it('does not render when success is false', () => {
            const action = {
                type: 'registrar_transacao',
                success: false,
                parameters: {
                    amount: 50,
                    category: 'Test',
                    description: 'Test',
                    type: 'expense'
                }
            }

            const { container } = render(<ActionFeedback action={action} />)
            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('Budget Creation', () => {
        it('renders budget creation feedback correctly', () => {
            const action = {
                type: 'criar_orcamento',
                success: true,
                parameters: {
                    amount: 500,
                    category: 'Lazer',
                    period: 'monthly'
                }
            }

            const { container } = render(<ActionFeedback action={action} />)

            expect(screen.getByText('Orçamento Criado')).toBeInTheDocument()
            expect(screen.getByText('Lazer')).toBeInTheDocument()
            expect(screen.getByText('Período: monthly')).toBeInTheDocument()
            expect(screen.getByText('R$ 500,00')).toBeInTheDocument()

            // Check for blue styling
            const card = container.querySelector('.bg-blue-50')
            expect(card).toBeInTheDocument()
        })

        it('renders budget with weekly period', () => {
            const action = {
                type: 'criar_orcamento',
                success: true,
                parameters: {
                    amount: 100,
                    category: 'Alimentação',
                    period: 'weekly'
                }
            }

            render(<ActionFeedback action={action} />)

            expect(screen.getByText('Período: weekly')).toBeInTheDocument()
        })

        it('renders budget with yearly period', () => {
            const action = {
                type: 'criar_orcamento',
                success: true,
                parameters: {
                    amount: 10000,
                    category: 'Saúde',
                    period: 'yearly'
                }
            }

            render(<ActionFeedback action={action} />)

            expect(screen.getByText('Período: yearly')).toBeInTheDocument()
            expect(screen.getByText('R$ 10.000,00')).toBeInTheDocument()
        })

        it('shows check icon for successful budget', () => {
            const action = {
                type: 'criar_orcamento',
                success: true,
                parameters: {
                    amount: 500,
                    category: 'Test',
                    period: 'monthly'
                }
            }

            const { container } = render(<ActionFeedback action={action} />)
            // CheckCircle2 icon is rendered
            const checkIcon = container.querySelector('svg')
            expect(checkIcon).toBeInTheDocument()
        })

        it('does not render when success is false', () => {
            const action = {
                type: 'criar_orcamento',
                success: false,
                parameters: {
                    amount: 500,
                    category: 'Test',
                    period: 'monthly'
                }
            }

            const { container } = render(<ActionFeedback action={action} />)
            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('Edge Cases', () => {
        it('returns null for unknown action types', () => {
            const action = {
                type: 'unknown_action',
                success: true,
                parameters: {}
            }

            const { container } = render(<ActionFeedback action={action} />)
            expect(container).toBeEmptyDOMElement()
        })

        it('returns null for criar_meta action', () => {
            const action = {
                type: 'criar_meta',
                success: true,
                parameters: {
                    name: 'Viagem',
                    target_amount: 5000
                }
            }

            const { container } = render(<ActionFeedback action={action} />)
            expect(container).toBeEmptyDOMElement()
        })

        it('returns null for buscar_transacoes action', () => {
            const action = {
                type: 'buscar_transacoes',
                success: true,
                parameters: {}
            }

            const { container } = render(<ActionFeedback action={action} />)
            expect(container).toBeEmptyDOMElement()
        })

        it('handles zero amount', () => {
            const action = {
                type: 'registrar_transacao',
                success: true,
                parameters: {
                    amount: 0,
                    category: 'Test',
                    description: 'Zero amount',
                    type: 'expense'
                }
            }

            render(<ActionFeedback action={action} />)
            expect(screen.getByText('-R$ 0,00')).toBeInTheDocument()
        })

        it('handles missing result property', () => {
            const action = {
                type: 'registrar_transacao',
                success: true,
                parameters: {
                    amount: 50,
                    category: 'Test',
                    description: 'Test',
                    type: 'expense'
                }
                // No result property
            }

            const { container } = render(<ActionFeedback action={action} />)
            expect(container).not.toBeEmptyDOMElement()
        })
    })

    describe('Styling and Animation', () => {
        it('applies fade-in animation class', () => {
            const action = {
                type: 'registrar_transacao',
                success: true,
                parameters: {
                    amount: 50,
                    category: 'Test',
                    description: 'Test',
                    type: 'expense'
                }
            }

            const { container } = render(<ActionFeedback action={action} />)
            const card = container.querySelector('.animate-fade-in')
            expect(card).toBeInTheDocument()
        })

        it('applies correct border colors for transaction', () => {
            const action = {
                type: 'registrar_transacao',
                success: true,
                parameters: {
                    amount: 50,
                    category: 'Test',
                    description: 'Test',
                    type: 'expense'
                }
            }

            const { container } = render(<ActionFeedback action={action} />)
            const card = container.querySelector('.border-green-200')
            expect(card).toBeInTheDocument()
        })

        it('applies correct border colors for budget', () => {
            const action = {
                type: 'criar_orcamento',
                success: true,
                parameters: {
                    amount: 500,
                    category: 'Test',
                    period: 'monthly'
                }
            }

            const { container } = render(<ActionFeedback action={action} />)
            const card = container.querySelector('.border-blue-200')
            expect(card).toBeInTheDocument()
        })
    })
})
