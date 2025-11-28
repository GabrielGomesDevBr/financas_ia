import { render, screen } from '@testing-library/react'
import { HelpCard } from '../HelpCard'
import { describe, it, expect } from 'vitest'

describe('HelpCard', () => {
    const mockCompleteData = {
        title: 'Como criar metas',
        description: 'Aprenda a criar metas financeiras.',
        steps: ['Passo 1', 'Passo 2', 'Passo 3'],
        examples: ['Exemplo 1', 'Exemplo 2'],
        action: { label: 'Ver Metas', url: '/goals' }
    }

    describe('Title and Description', () => {
        it('renders title correctly', () => {
            render(<HelpCard data={mockCompleteData} />)
            expect(screen.getByText('Como criar metas')).toBeInTheDocument()
        })

        it('renders description when provided', () => {
            render(<HelpCard data={mockCompleteData} />)
            expect(screen.getByText('Aprenda a criar metas financeiras.')).toBeInTheDocument()
        })

        it('does not render description section when not provided', () => {
            const dataWithoutDescription = {
                title: 'Test Title',
                steps: ['Step 1']
            }
            const { container } = render(<HelpCard data={dataWithoutDescription} />)
            expect(container.querySelector('.text-indigo-900.mb-3')).not.toBeInTheDocument()
        })

        it('shows lightbulb icon', () => {
            const { container } = render(<HelpCard data={mockCompleteData} />)
            const icon = container.querySelector('.lucide-lightbulb')
            expect(icon).toBeInTheDocument()
        })

        it('applies correct heading styling', () => {
            const { container } = render(<HelpCard data={mockCompleteData} />)
            const heading = screen.getByText('Como criar metas')
            expect(heading.tagName).toBe('H4')
            expect(heading).toHaveClass('font-semibold')
        })
    })

    describe('Steps List', () => {
        it('renders all steps correctly', () => {
            render(<HelpCard data={mockCompleteData} />)
            expect(screen.getByText('Passo 1')).toBeInTheDocument()
            expect(screen.getByText('Passo 2')).toBeInTheDocument()
            expect(screen.getByText('Passo 3')).toBeInTheDocument()
        })

        it('renders steps as list items', () => {
            const { container } = render(<HelpCard data={mockCompleteData} />)
            const listItems = container.querySelectorAll('ul.list-disc li')
            expect(listItems.length).toBeGreaterThanOrEqual(3)
        })

        it('does not render steps section when not provided', () => {
            const dataWithoutSteps = {
                title: 'Test Title',
                description: 'Test description'
            }
            const { container } = render(<HelpCard data={dataWithoutSteps} />)
            const stepsList = container.querySelector('ul.list-disc')
            expect(stepsList).not.toBeInTheDocument()
        })

        it('handles single step', () => {
            const dataWithOneStep = {
                title: 'Test',
                steps: ['Only one step']
            }
            render(<HelpCard data={dataWithOneStep} />)
            expect(screen.getByText('Only one step')).toBeInTheDocument()
        })

        it('handles many steps', () => {
            const dataWithManySteps = {
                title: 'Test',
                steps: Array.from({ length: 10 }, (_, i) => `Step ${i + 1}`)
            }
            render(<HelpCard data={dataWithManySteps} />)
            expect(screen.getByText('Step 1')).toBeInTheDocument()
            expect(screen.getByText('Step 10')).toBeInTheDocument()
        })
    })

    describe('Examples List', () => {
        it('renders all examples correctly', () => {
            render(<HelpCard data={mockCompleteData} />)
            expect(screen.getByText('"Exemplo 1"')).toBeInTheDocument()
            expect(screen.getByText('"Exemplo 2"')).toBeInTheDocument()
        })

        it('shows "Tente dizer:" label', () => {
            render(<HelpCard data={mockCompleteData} />)
            expect(screen.getByText('Tente dizer:')).toBeInTheDocument()
        })

        it('wraps examples in quotes', () => {
            const dataWithExamples = {
                title: 'Test',
                examples: ['criar meta de viagem']
            }
            render(<HelpCard data={dataWithExamples} />)
            expect(screen.getByText('"criar meta de viagem"')).toBeInTheDocument()
        })

        it('does not render examples section when not provided', () => {
            const dataWithoutExamples = {
                title: 'Test Title',
                description: 'Test description'
            }
            render(<HelpCard data={dataWithoutExamples} />)
            expect(screen.queryByText('Tente dizer:')).not.toBeInTheDocument()
        })

        it('handles empty examples array', () => {
            const dataWithEmptyExamples = {
                title: 'Test',
                examples: []
            }
            const { container } = render(<HelpCard data={dataWithEmptyExamples} />)
            const examplesContainer = container.querySelector('.bg-white\\/60')
            expect(examplesContainer).toBeInTheDocument()
        })

        it('applies italic styling to examples', () => {
            const { container } = render(<HelpCard data={mockCompleteData} />)
            const examplesList = container.querySelector('.italic')
            expect(examplesList).toBeInTheDocument()
        })
    })

    describe('Action Button', () => {
        it('renders action button with correct label', () => {
            render(<HelpCard data={mockCompleteData} />)
            expect(screen.getByText('Ver Metas')).toBeInTheDocument()
        })

        it('renders link with correct href', () => {
            render(<HelpCard data={mockCompleteData} />)
            const link = screen.getByRole('link')
            expect(link).toHaveAttribute('href', '/goals')
        })

        it('shows arrow icon in button', () => {
            const { container } = render(<HelpCard data={mockCompleteData} />)
            const arrowIcon = container.querySelector('.lucide-arrow-right')
            expect(arrowIcon).toBeInTheDocument()
        })

        it('does not render action button when not provided', () => {
            const dataWithoutAction = {
                title: 'Test Title',
                description: 'Test description'
            }
            render(<HelpCard data={dataWithoutAction} />)
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })

        it('handles different action URLs', () => {
            const dataWithDifferentUrl = {
                title: 'Test',
                action: { label: 'Go to Dashboard', url: '/dashboard' }
            }
            render(<HelpCard data={dataWithDifferentUrl} />)
            const link = screen.getByRole('link')
            expect(link).toHaveAttribute('href', '/dashboard')
        })

        it('applies button styling correctly', () => {
            render(<HelpCard data={mockCompleteData} />)
            const button = screen.getByRole('button')
            expect(button).toHaveClass('w-full')
        })
    })

    describe('Styling and Appearance', () => {
        it('applies card styling with indigo theme', () => {
            const { container } = render(<HelpCard data={mockCompleteData} />)
            const card = container.querySelector('.bg-indigo-50')
            expect(card).toBeInTheDocument()
        })

        it('applies fade-in animation', () => {
            const { container } = render(<HelpCard data={mockCompleteData} />)
            const card = container.querySelector('.animate-fade-in')
            expect(card).toBeInTheDocument()
        })

        it('applies correct border color', () => {
            const { container } = render(<HelpCard data={mockCompleteData} />)
            const card = container.querySelector('.border-indigo-100')
            expect(card).toBeInTheDocument()
        })

        it('applies correct text colors to title section', () => {
            const { container } = render(<HelpCard data={mockCompleteData} />)
            const titleContainer = container.querySelector('.text-indigo-700')
            expect(titleContainer).toBeInTheDocument()
        })
    })

    describe('Complete Scenarios', () => {
        it('renders with all optional fields present', () => {
            render(<HelpCard data={mockCompleteData} />)
            expect(screen.getByText('Como criar metas')).toBeInTheDocument()
            expect(screen.getByText('Aprenda a criar metas financeiras.')).toBeInTheDocument()
            expect(screen.getByText('Passo 1')).toBeInTheDocument()
            expect(screen.getByText('"Exemplo 1"')).toBeInTheDocument()
            expect(screen.getByRole('link')).toBeInTheDocument()
        })

        it('renders with only title (minimal)', () => {
            const minimalData = {
                title: 'Just a title'
            }
            render(<HelpCard data={minimalData} />)
            expect(screen.getByText('Just a title')).toBeInTheDocument()
        })

        it('renders with title and action only', () => {
            const titleAndAction = {
                title: 'Help Topic',
                action: { label: 'Learn More', url: '/help' }
            }
            render(<HelpCard data={titleAndAction} />)
            expect(screen.getByText('Help Topic')).toBeInTheDocument()
            expect(screen.getByRole('link')).toHaveAttribute('href', '/help')
        })

        it('renders with title, description and steps only', () => {
            const dataWithoutExamplesAndAction = {
                title: 'Tutorial',
                description: 'Learn how to use this feature',
                steps: ['First', 'Second', 'Third']
            }
            render(<HelpCard data={dataWithoutExamplesAndAction} />)
            expect(screen.getByText('Tutorial')).toBeInTheDocument()
            expect(screen.getByText('Learn how to use this feature')).toBeInTheDocument()
            expect(screen.getByText('First')).toBeInTheDocument()
            expect(screen.queryByText('Tente dizer:')).not.toBeInTheDocument()
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })
    })

    describe('Edge Cases', () => {
        it('handles very long title', () => {
            const longTitleData = {
                title: 'Este é um título muito longo que deveria ser exibido corretamente sem quebrar o layout do card'
            }
            render(<HelpCard data={longTitleData} />)
            expect(screen.getByText(longTitleData.title)).toBeInTheDocument()
        })

        it('handles very long description', () => {
            const longDescData = {
                title: 'Test',
                description: 'Esta é uma descrição muito longa que pode conter várias linhas de texto explicando detalhadamente como usar uma funcionalidade específica da aplicação.'
            }
            render(<HelpCard data={longDescData} />)
            expect(screen.getByText(longDescData.description)).toBeInTheDocument()
        })

        it('handles special characters in title', () => {
            const specialCharsData = {
                title: 'Como usar R$ & % no sistema?'
            }
            render(<HelpCard data={specialCharsData} />)
            expect(screen.getByText('Como usar R$ & % no sistema?')).toBeInTheDocument()
        })

        it('handles HTML-like content safely', () => {
            const htmlContentData = {
                title: '<script>alert("test")</script>',
                description: '<b>Bold text</b>'
            }
            render(<HelpCard data={htmlContentData} />)
            // Should render as text, not execute/parse HTML
            expect(screen.getByText('<script>alert("test")</script>')).toBeInTheDocument()
            expect(screen.getByText('<b>Bold text</b>')).toBeInTheDocument()
        })
    })
})
