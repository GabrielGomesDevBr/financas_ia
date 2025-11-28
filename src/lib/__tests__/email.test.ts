import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Resend module - must be before imports
const mockSend = vi.hoisted(() => vi.fn())
vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = {
        send: mockSend
      }
    }
  }
})

import {
  sendEmail,
  sendInviteEmail,
  sendPasswordChangeEmail,
  sendBudgetAlertEmail,
  sendGoalAlertEmail,
  sendTransactionAlertEmail,
  sendFamilyAlertEmail,
  sendWaitlistNotificationEmail,
  sendAdminNewUserNotification
} from '../email'

describe('Email System', () => {
  beforeEach(() => {
    mockSend.mockClear()
    vi.clearAllMocks()
  })

  describe('sendEmail', () => {
    it('sends email successfully', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendEmail('test@example.com', 'Test Subject', '<p>Test Content</p>')

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
      expect(mockSend).toHaveBeenCalledWith({
        from: expect.stringContaining('onboarding@resend.dev'),
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test Content</p>'
      })
    })

    it('handles resend API error', async () => {
      const apiError = { message: 'API Error' }
      mockSend.mockResolvedValue({ data: null, error: apiError })

      const result = await sendEmail('test@example.com', 'Subject', 'Content')

      expect(result.success).toBe(false)
      expect(result.error).toEqual(apiError)
    })

    it('handles exception during send', async () => {
      const exception = new Error('Network error')
      mockSend.mockRejectedValue(exception)

      const result = await sendEmail('test@example.com', 'Subject', 'Content')

      expect(result.success).toBe(false)
      expect(result.error).toEqual(exception)
    })

    it('includes correct from address', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendEmail('test@example.com', 'Subject', 'Content')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('Assistente Financeiro')
        })
      )
    })
  })

  describe('sendInviteEmail', () => {
    it('sends invite email with correct subject', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendInviteEmail('invitee@example.com', 'https://app.com/invite/abc', 'João Silva')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'invitee@example.com',
          subject: 'João Silva convidou você para a família no Assistente Financeiro'
        })
      )
    })

    it('includes invite link in HTML', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendInviteEmail('invitee@example.com', 'https://app.com/invite/abc', 'João Silva')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('https://app.com/invite/abc')
    })

    it('includes inviter name in HTML', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendInviteEmail('invitee@example.com', 'https://app.com/invite/abc', 'Maria Santos')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('Maria Santos')
    })

    it('includes call-to-action button', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendInviteEmail('invitee@example.com', 'https://app.com/invite/abc', 'João Silva')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('Aceitar Convite')
    })

    it('returns success result', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendInviteEmail('invitee@example.com', 'https://app.com/invite/abc', 'João Silva')

      expect(result.success).toBe(true)
    })

    it('handles error from sendEmail', async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: 'Failed' } })

      const result = await sendInviteEmail('invitee@example.com', 'https://app.com/invite/abc', 'João Silva')

      expect(result.success).toBe(false)
    })
  })

  describe('sendPasswordChangeEmail', () => {
    it('sends password change email with correct subject', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendPasswordChangeEmail('user@example.com', 'João Silva')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Sua senha foi alterada - Assistente Financeiro'
        })
      )
    })

    it('includes user name in HTML', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendPasswordChangeEmail('user@example.com', 'Maria Santos')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('Maria Santos')
    })

    it('includes security warning', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendPasswordChangeEmail('user@example.com', 'João Silva')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('NÃO foi você')
    })

    it('returns success result', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendPasswordChangeEmail('user@example.com', 'João Silva')

      expect(result.success).toBe(true)
    })
  })

  describe('sendBudgetAlertEmail', () => {
    it('sends budget alert with correct subject', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendBudgetAlertEmail('user@example.com', 'João Silva', 'Alimentação', 1200, 1000)

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: '⚠️ Alerta de Orçamento: Alimentação'
        })
      )
    })

    it('includes category name in subject', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendBudgetAlertEmail('user@example.com', 'João Silva', 'Transporte', 800, 500)

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Transporte')
        })
      )
    })

    it('calculates percentage correctly', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendBudgetAlertEmail('user@example.com', 'João Silva', 'Alimentação', 1200, 1000)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('120%')
    })

    it('includes current amount and limit', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendBudgetAlertEmail('user@example.com', 'João Silva', 'Alimentação', 1200, 1000)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('R$ 1200.00')
      expect(callArgs.html).toContain('R$ 1000.00')
    })

    it('includes user name in HTML', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendBudgetAlertEmail('user@example.com', 'Maria Santos', 'Alimentação', 1200, 1000)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('Maria Santos')
    })

    it('returns success result', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendBudgetAlertEmail('user@example.com', 'João Silva', 'Alimentação', 1200, 1000)

      expect(result.success).toBe(true)
    })

    it('handles decimal amounts correctly', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendBudgetAlertEmail('user@example.com', 'João Silva', 'Alimentação', 1234.56, 1000.50)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('R$ 1234.56')
      expect(callArgs.html).toContain('R$ 1000.50')
    })

    it('rounds percentage to nearest integer', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendBudgetAlertEmail('user@example.com', 'João Silva', 'Alimentação', 555, 1000)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('56%')
    })
  })

  describe('sendGoalAlertEmail', () => {
    it('sends goal alert with correct subject', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendGoalAlertEmail('user@example.com', 'João Silva', 'Viagem para Europa', 5000, 10000)

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: '🎯 Atualização de Meta: Viagem para Europa'
        })
      )
    })

    it('includes goal name in subject', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendGoalAlertEmail('user@example.com', 'João Silva', 'Carro Novo', 15000, 50000)

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Carro Novo')
        })
      )
    })

    it('calculates percentage correctly', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendGoalAlertEmail('user@example.com', 'João Silva', 'Meta', 7500, 10000)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('75%')
    })

    it('includes current and target amounts', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendGoalAlertEmail('user@example.com', 'João Silva', 'Meta', 5000, 10000)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('R$ 5000.00')
      expect(callArgs.html).toContain('R$ 10000.00')
    })

    it('includes user name in HTML', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendGoalAlertEmail('user@example.com', 'Carlos Lima', 'Meta', 5000, 10000)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('Carlos Lima')
    })

    it('returns success result', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendGoalAlertEmail('user@example.com', 'João Silva', 'Meta', 5000, 10000)

      expect(result.success).toBe(true)
    })

    it('handles decimal amounts correctly', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendGoalAlertEmail('user@example.com', 'João Silva', 'Meta', 5432.10, 10000.99)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('R$ 5432.10')
      expect(callArgs.html).toContain('R$ 10000.99')
    })
  })

  describe('sendTransactionAlertEmail', () => {
    const expenseTransaction = {
      type: 'expense',
      description: 'Almoço no restaurante',
      amount: 50,
      date: '2024-01-15'
    }

    const incomeTransaction = {
      type: 'income',
      description: 'Salário',
      amount: 5000,
      date: '2024-01-15'
    }

    it('sends transaction alert for expense', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendTransactionAlertEmail('user@example.com', 'João Silva', expenseTransaction)

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Nova Despesa')
        })
      )
    })

    it('sends transaction alert for income', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendTransactionAlertEmail('user@example.com', 'João Silva', incomeTransaction)

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Nova Receita')
        })
      )
    })

    it('includes expense emoji in subject', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendTransactionAlertEmail('user@example.com', 'João Silva', expenseTransaction)

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('💸')
        })
      )
    })

    it('includes income emoji in subject', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendTransactionAlertEmail('user@example.com', 'João Silva', incomeTransaction)

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('💰')
        })
      )
    })

    it('includes transaction description in subject', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendTransactionAlertEmail('user@example.com', 'João Silva', expenseTransaction)

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Almoço no restaurante')
        })
      )
    })

    it('includes transaction details in HTML', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendTransactionAlertEmail('user@example.com', 'João Silva', expenseTransaction)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('Almoço no restaurante')
      expect(callArgs.html).toContain('R$ 50.00')
    })

    it('formats date in pt-BR locale', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendTransactionAlertEmail('user@example.com', 'João Silva', expenseTransaction)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    it('includes user name in HTML', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendTransactionAlertEmail('user@example.com', 'Ana Paula', expenseTransaction)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('Ana Paula')
    })

    it('returns success result', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendTransactionAlertEmail('user@example.com', 'João Silva', expenseTransaction)

      expect(result.success).toBe(true)
    })

    it('handles decimal amounts correctly', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const transaction = { ...expenseTransaction, amount: 123.45 }
      await sendTransactionAlertEmail('user@example.com', 'João Silva', transaction)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('R$ 123.45')
    })

    it('handles large amounts correctly', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const transaction = { ...incomeTransaction, amount: 15000.50 }
      await sendTransactionAlertEmail('user@example.com', 'João Silva', transaction)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('R$ 15000.50')
    })
  })

  describe('sendFamilyAlertEmail', () => {
    it('sends family alert with correct subject', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendFamilyAlertEmail('user@example.com', 'João Silva', 'Maria entrou na família')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: '👥 Atualização da Família'
        })
      )
    })

    it('includes user name in HTML', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendFamilyAlertEmail('user@example.com', 'Carlos Lima', 'Maria entrou na família')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('Carlos Lima')
    })

    it('includes custom message in HTML', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendFamilyAlertEmail('user@example.com', 'João Silva', 'Pedro foi removido da família')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('Pedro foi removido da família')
    })

    it('returns success result', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendFamilyAlertEmail('user@example.com', 'João Silva', 'Mensagem de teste')

      expect(result.success).toBe(true)
    })

    it('handles long messages', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const longMessage = 'Esta é uma mensagem muito longa que contém muitas informações sobre a atividade na família.'
      await sendFamilyAlertEmail('user@example.com', 'João Silva', longMessage)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain(longMessage)
    })

    it('handles special characters in message', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const message = 'João & Maria adicionaram "Nova Meta" com <valor> de R$ 10.000'
      await sendFamilyAlertEmail('user@example.com', 'João Silva', message)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain(message)
    })
  })

  describe('sendWaitlistNotificationEmail', () => {
    it('sends waitlist notification with correct subject', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendWaitlistNotificationEmail('user@example.com', 'João Silva')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Você está na lista de espera - Assistente Financeiro'
        })
      )
    })

    it('includes user name when provided', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendWaitlistNotificationEmail('user@example.com', 'Maria Santos')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('Maria Santos')
    })

    it('handles empty user name', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendWaitlistNotificationEmail('user@example.com', '')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('Olá!')
    })

    it('includes contact information', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendWaitlistNotificationEmail('user@example.com', 'João Silva')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('gabrielgomesdevbr@gmail.com')
    })

    it('includes timeframe information', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendWaitlistNotificationEmail('user@example.com', 'João Silva')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('24 horas')
    })

    it('returns success result', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendWaitlistNotificationEmail('user@example.com', 'João Silva')

      expect(result.success).toBe(true)
    })
  })

  describe('sendAdminNewUserNotification', () => {
    it('sends admin notification with correct subject', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendAdminNewUserNotification('admin@example.com', 'newuser@example.com', 'João Silva')

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin@example.com',
          subject: '🔔 Novo usuário na waitlist - Assistente Financeiro'
        })
      )
    })

    it('includes new user email', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendAdminNewUserNotification('admin@example.com', 'newuser@example.com', 'João Silva')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('newuser@example.com')
    })

    it('includes new user name', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendAdminNewUserNotification('admin@example.com', 'newuser@example.com', 'Maria Santos')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('Maria Santos')
    })

    it('handles empty user name', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendAdminNewUserNotification('admin@example.com', 'newuser@example.com', '')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('Não informado')
    })

    it('includes link to admin panel', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendAdminNewUserNotification('admin@example.com', 'newuser@example.com', 'João Silva')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('/admin/users')
    })

    it('returns success result', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const result = await sendAdminNewUserNotification('admin@example.com', 'newuser@example.com', 'João Silva')

      expect(result.success).toBe(true)
    })

    it('includes date in notification', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendAdminNewUserNotification('admin@example.com', 'newuser@example.com', 'João Silva')

      const callArgs = mockSend.mock.calls[0][0]
      // Should contain date pattern like 15/01/2024
      expect(callArgs.html).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })
  })

  describe('Edge Cases', () => {
    it('handles very long email addresses', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const longEmail = 'very.long.email.address.that.exceeds.normal.length@verylongdomainname.example.com'
      const result = await sendEmail(longEmail, 'Subject', 'Content')

      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: longEmail
        })
      )
    })

    it('handles very long subjects', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const longSubject = 'This is a very long subject line that contains a lot of information about the email content and purpose which may exceed typical length limits but should still be handled properly by the email system'
      const result = await sendEmail('test@example.com', longSubject, 'Content')

      expect(result.success).toBe(true)
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: longSubject
        })
      )
    })

    it('handles special characters in names', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendPasswordChangeEmail('test@example.com', "João d'Ávila & Silva <Test>")

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain("João d'Ávila & Silva <Test>")
    })

    it('handles zero amounts', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendBudgetAlertEmail('test@example.com', 'Test User', 'Category', 0, 1000)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('R$ 0.00')
      expect(callArgs.html).toContain('0%')
    })

    it('handles negative amounts as strings', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const transaction = {
        type: 'expense',
        description: 'Test',
        amount: '-50',
        date: '2024-01-15'
      }

      await sendTransactionAlertEmail('test@example.com', 'Test User', transaction)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('R$ -50.00')
    })

    it('handles malformed dates gracefully', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const transaction = {
        type: 'expense',
        description: 'Test',
        amount: 50,
        date: 'invalid-date'
      }

      await sendTransactionAlertEmail('test@example.com', 'Test User', transaction)

      // Should not throw, even if date formatting fails
      expect(mockSend).toHaveBeenCalled()
    })

    it('handles undefined optional parameters', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const transaction = {
        type: 'expense',
        description: 'Test',
        amount: undefined,
        date: undefined
      }

      await sendTransactionAlertEmail('test@example.com', 'Test User', transaction)

      expect(mockSend).toHaveBeenCalled()
    })
  })

  describe('HTML Content Validation', () => {
    it('all emails have valid HTML structure', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendInviteEmail('test@example.com', 'http://link.com', 'Test User')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('<div')
      expect(callArgs.html).toContain('</div>')
    })

    it('all emails use inline styles', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendPasswordChangeEmail('test@example.com', 'Test User')

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('style=')
    })

    it('all emails have max-width constraint', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendBudgetAlertEmail('test@example.com', 'Test User', 'Category', 1000, 800)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('max-width: 600px')
    })

    it('all emails use sans-serif font', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendGoalAlertEmail('test@example.com', 'Test User', 'Goal', 5000, 10000)

      const callArgs = mockSend.mock.calls[0][0]
      expect(callArgs.html).toContain('font-family: sans-serif')
    })
  })

  describe('Return Value Consistency', () => {
    it('all email functions return EmailResult interface', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const results = await Promise.all([
        sendInviteEmail('test@example.com', 'http://link.com', 'User'),
        sendPasswordChangeEmail('test@example.com', 'User'),
        sendBudgetAlertEmail('test@example.com', 'User', 'Cat', 100, 80),
        sendGoalAlertEmail('test@example.com', 'User', 'Goal', 50, 100),
        sendTransactionAlertEmail('test@example.com', 'User', { type: 'expense', description: 'T', amount: 10, date: '2024-01-01' }),
        sendFamilyAlertEmail('test@example.com', 'User', 'Message'),
        sendWaitlistNotificationEmail('test@example.com', 'User'),
        sendAdminNewUserNotification('admin@example.com', 'new@example.com', 'New User')
      ])

      results.forEach(result => {
        expect(result).toHaveProperty('success')
        expect(typeof result.success).toBe('boolean')
      })
    })

    it('all email functions return success=true on success', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const results = await Promise.all([
        sendInviteEmail('test@example.com', 'http://link.com', 'User'),
        sendPasswordChangeEmail('test@example.com', 'User')
      ])

      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })

    it('all email functions return success=false on error', async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: 'Error' } })

      const results = await Promise.all([
        sendInviteEmail('test@example.com', 'http://link.com', 'User'),
        sendPasswordChangeEmail('test@example.com', 'User')
      ])

      results.forEach(result => {
        expect(result.success).toBe(false)
        expect(result.error).toBeDefined()
      })
    })
  })
})
