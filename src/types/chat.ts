/**
 * Chat-related types and interfaces
 */

/**
 * Chat message role
 */
export type ChatRole = 'user' | 'assistant' | 'system'

/**
 * Chat message interface
 */
export interface ChatMessage {
    id: string
    conversation_id: string
    role: ChatRole
    content: string
    created_at: string
}

/**
 * Conversation interface
 */
export interface Conversation {
    id: string
    user_id: string
    family_id: string
    title: string
    created_at: string
    last_message_at?: string
}

/**
 * Assistant personality types
 */
export type AssistantPersonality = 'friendly' | 'professional' | 'casual' | 'marcos'
