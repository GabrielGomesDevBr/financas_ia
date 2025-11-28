import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatMessage } from '../ChatMessage'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toast } from 'react-hot-toast'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

// Mock clipboard API
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
    },
})

describe('ChatMessage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('User Messages', () => {
        it('renders user message correctly', () => {
            render(<ChatMessage role="user" content="Olá, assistente!" />)
            expect(screen.getByText('Olá, assistente!')).toBeInTheDocument()
        })

        it('applies correct styling for user messages', () => {
            const { container } = render(<ChatMessage role="user" content="Test" />)
            const messageWrapper = container.querySelector('.bg-white')
            expect(messageWrapper).toBeInTheDocument()
        })

        it('renders user avatar with gradient background when no custom avatar provided', () => {
            const { container } = render(<ChatMessage role="user" content="Test" />)
            const avatar = container.querySelector('.bg-gradient-to-br.from-blue-500.to-blue-600')
            expect(avatar).toBeInTheDocument()
        })

        it('renders custom user avatar when provided', () => {
            render(<ChatMessage role="user" content="Test" userAvatar="https://example.com/avatar.jpg" />)
            const avatar = screen.getByAltText('User')
            expect(avatar).toBeInTheDocument()
            expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
        })

        it('preserves whitespace in user messages', () => {
            const multilineText = "Line 1\nLine 2\nLine 3"
            const { container } = render(<ChatMessage role="user" content={multilineText} />)
            const paragraph = container.querySelector('.whitespace-pre-wrap')
            expect(paragraph).toBeInTheDocument()
        })

        it('does not show action buttons for user messages', () => {
            const { container } = render(<ChatMessage role="user" content="Test" />)
            expect(container.querySelector('button[title="Copiar"]')).not.toBeInTheDocument()
        })
    })

    describe('Assistant Messages', () => {
        it('renders assistant message correctly', () => {
            render(<ChatMessage role="assistant" content="Olá, como posso ajudar?" />)
            expect(screen.getByText('Olá, como posso ajudar?')).toBeInTheDocument()
        })

        it('applies correct styling for assistant messages', () => {
            const { container } = render(<ChatMessage role="assistant" content="Test" />)
            const messageWrapper = container.querySelector('.bg-neutral-50')
            expect(messageWrapper).toBeInTheDocument()
        })

        it('renders assistant avatar with bot icon', () => {
            const { container } = render(<ChatMessage role="assistant" content="Test" />)
            const avatar = container.querySelector('.bg-gradient-to-br.from-green-500.to-emerald-600')
            expect(avatar).toBeInTheDocument()
        })

        it('renders markdown content for assistant messages', () => {
            const markdownContent = "**Bold text** and *italic text*"
            render(<ChatMessage role="assistant" content={markdownContent} />)
            expect(screen.getByText('Bold text')).toBeInTheDocument()
            expect(screen.getByText('italic text')).toBeInTheDocument()
        })

        it('renders markdown lists correctly', () => {
            const listContent = "Items:\n- Item 1\n- Item 2"
            render(<ChatMessage role="assistant" content={listContent} />)
            expect(screen.getByText('Item 1')).toBeInTheDocument()
            expect(screen.getByText('Item 2')).toBeInTheDocument()
        })

        it('renders inline code blocks', () => {
            const codeContent = "Use `formatCurrency()` function"
            const { container } = render(<ChatMessage role="assistant" content={codeContent} />)
            const codeElement = container.querySelector('code')
            expect(codeElement).toBeInTheDocument()
            expect(codeElement).toHaveTextContent('formatCurrency()')
        })
    })

    describe('Action Buttons', () => {
        it('shows action buttons for assistant messages', () => {
            render(<ChatMessage role="assistant" content="Test" />)
            expect(screen.getByTitle('Copiar')).toBeInTheDocument()
            expect(screen.getByTitle('Gostei')).toBeInTheDocument()
            expect(screen.getByTitle('Não gostei')).toBeInTheDocument()
        })

        it('copies content to clipboard when copy button is clicked', async () => {
            const content = "Test content to copy"
            render(<ChatMessage role="assistant" content={content} />)

            const copyButton = screen.getByTitle('Copiar')
            fireEvent.click(copyButton)

            await waitFor(() => {
                expect(navigator.clipboard.writeText).toHaveBeenCalledWith(content)
                expect(toast.success).toHaveBeenCalledWith('Copiado!')
            })
        })

        it('shows check icon after successful copy', async () => {
            render(<ChatMessage role="assistant" content="Test" />)

            const copyButton = screen.getByTitle('Copiar')
            fireEvent.click(copyButton)

            await waitFor(() => {
                expect(screen.getByTitle('Copiar').querySelector('.lucide-check')).toBeInTheDocument()
            })
        })

        it('handles copy error gracefully', async () => {
            vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('Copy failed'))

            render(<ChatMessage role="assistant" content="Test" />)
            const copyButton = screen.getByTitle('Copiar')
            fireEvent.click(copyButton)

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Erro ao copiar')
            })
        })

        it('toggles like state when like button is clicked', () => {
            const { container } = render(<ChatMessage role="assistant" content="Test" />)

            const likeButton = screen.getByTitle('Gostei')
            expect(likeButton).not.toHaveClass('text-blue-600')

            fireEvent.click(likeButton)
            expect(likeButton).toHaveClass('text-blue-600')

            fireEvent.click(likeButton)
            expect(likeButton).not.toHaveClass('text-blue-600')
        })

        it('toggles dislike state when dislike button is clicked', () => {
            render(<ChatMessage role="assistant" content="Test" />)

            const dislikeButton = screen.getByTitle('Não gostei')
            expect(dislikeButton).not.toHaveClass('text-blue-600')

            fireEvent.click(dislikeButton)
            expect(dislikeButton).toHaveClass('text-blue-600')

            fireEvent.click(dislikeButton)
            expect(dislikeButton).not.toHaveClass('text-blue-600')
        })

        it('resets like when dislike is clicked and vice versa', () => {
            render(<ChatMessage role="assistant" content="Test" />)

            const likeButton = screen.getByTitle('Gostei')
            const dislikeButton = screen.getByTitle('Não gostei')

            fireEvent.click(likeButton)
            expect(likeButton).toHaveClass('text-blue-600')

            fireEvent.click(dislikeButton)
            expect(likeButton).not.toHaveClass('text-blue-600')
            expect(dislikeButton).toHaveClass('text-blue-600')
        })

        it('shows regenerate button when onRegenerate prop is provided', () => {
            const handleRegenerate = vi.fn()
            render(<ChatMessage role="assistant" content="Test" onRegenerate={handleRegenerate} />)

            expect(screen.getByTitle('Regenerar resposta')).toBeInTheDocument()
        })

        it('calls onRegenerate when regenerate button is clicked', () => {
            const handleRegenerate = vi.fn()
            render(<ChatMessage role="assistant" content="Test" onRegenerate={handleRegenerate} />)

            const regenerateButton = screen.getByTitle('Regenerar resposta')
            fireEvent.click(regenerateButton)

            expect(handleRegenerate).toHaveBeenCalledTimes(1)
        })

        it('does not show regenerate button when onRegenerate is not provided', () => {
            render(<ChatMessage role="assistant" content="Test" />)

            expect(screen.queryByTitle('Regenerar resposta')).not.toBeInTheDocument()
        })
    })

    describe('Accessibility', () => {
        it('has proper alt text for user avatar', () => {
            render(<ChatMessage role="user" content="Test" userAvatar="https://example.com/avatar.jpg" />)
            expect(screen.getByAltText('User')).toBeInTheDocument()
        })

        it('has title attributes on all action buttons', () => {
            render(<ChatMessage role="assistant" content="Test" onRegenerate={() => {}} />)

            expect(screen.getByTitle('Copiar')).toBeInTheDocument()
            expect(screen.getByTitle('Gostei')).toBeInTheDocument()
            expect(screen.getByTitle('Não gostei')).toBeInTheDocument()
            expect(screen.getByTitle('Regenerar resposta')).toBeInTheDocument()
        })
    })

    describe('Markdown Rendering', () => {
        it('renders GitHub Flavored Markdown features', () => {
            const gfmContent = "~~Strikethrough~~ text"
            render(<ChatMessage role="assistant" content={gfmContent} />)
            expect(screen.getByText('Strikethrough')).toBeInTheDocument()
        })

        it('applies custom styles to markdown elements', () => {
            const { container } = render(
                <ChatMessage role="assistant" content="**Bold** text" />
            )
            const strong = container.querySelector('strong')
            expect(strong).toHaveClass('font-bold')
        })

        it('renders numbered lists', () => {
            const listContent = "Steps:\n1. First\n2. Second"
            render(<ChatMessage role="assistant" content={listContent} />)
            expect(screen.getByText('First')).toBeInTheDocument()
            expect(screen.getByText('Second')).toBeInTheDocument()
        })
    })
})
