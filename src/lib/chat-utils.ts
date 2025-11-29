// Utility functions for chat humanization features

/**
 * Get contextual greeting based on time of day
 */
export function getTimeBasedGreeting(): string {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 12) {
        return 'Bom dia! ☀️'
    } else if (hour >= 12 && hour < 18) {
        return 'Boa tarde! 👋'
    } else {
        return 'Boa noite! 🌙'
    }
}

/**
 * Get day of week context
 */
export function getDayContext(): { day: string; context: string } {
    const days = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
    const dayIndex = new Date().getDay()
    const dayName = days[dayIndex]

    const contexts: Record<string, string> = {
        'segunda': 'Início de semana, vamos organizar essas finanças!',
        'terça': 'Terça-feira, dia de manter o foco!',
        'quarta': 'Meio da semana! Já economizou algo hoje?',
        'quinta': 'Quinta-feira, quase lá!',
        'sexta': 'Sextou! Mas não gaste à toa no fim de semana!',
        'sábado': 'Final de semana! Cuidado com os gastos extras.',
        'domingo': 'Domingão! Hora de planejar a semana financeira.'
    }

    return {
        day: dayName,
        context: contexts[dayName] || ''
    }
}

/**
 * Check for special dates/events
 */
export function getSpecialDateContext(): string | null {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()

    // Black Friday (última sexta de novembro - aproximação)
    if (month === 11 && day >= 23 && day <= 29) {
        return '⚠️ Black Friday chegando! Cuidado com as "promoções" enganosas!'
    }

    // Natal
    if (month === 12 && day >= 20) {
        return '🎄 Época de Natal! Planeje bem os gastos para não se endividar!'
    }

    // Ano Novo
    if (month === 1 && day <= 7) {
        return '🎆 Ano Novo! Que tal começar o ano com as finanças organizadas?'
    }

    // Dia das Mães (aproximação - 2º domingo de maio)
    if (month === 5 && day >= 8 && day <= 14) {
        return '💝 Semana do Dia das Mães! Planeje o presente com carinho e sem estourar o orçamento.'
    }

    // Dia dos Pais (aproximação - 2º domingo de agosto)
    if (month === 8 && day >= 8 && day <= 14) {
        return '👨 Semana do Dia dos Pais! Lembre-se: presente bom não precisa ser caro.'
    }

    // Carnaval (varia, mas geralmente fevereiro/março)
    if ((month === 2 && day >= 20) || (month === 3 && day <= 5)) {
        return '🎉 Época de Carnaval! Curta, mas sem endividamento!'
    }

    return null
}

/**
 * Detect easter egg keywords in message
 */
export function detectEasterEgg(message: string): string | null {
    const lowerMessage = message.toLowerCase()

    // Pizza/Delivery
    if (lowerMessage.includes('pizza') || lowerMessage.includes('ifood') || lowerMessage.includes('delivery')) {
        return 'delivery'
    }

    // Streaming
    if (lowerMessage.includes('netflix') || lowerMessage.includes('spotify') || lowerMessage.includes('streaming') || lowerMessage.includes('disney')) {
        return 'streaming'
    }

    // Uber/Transporte
    if (lowerMessage.includes('uber') || lowerMessage.includes('99') || lowerMessage.includes('táxi') || lowerMessage.includes('taxi')) {
        return 'uber'
    }

    // Parcelamento
    if (lowerMessage.includes('parcela') || lowerMessage.includes('parcelar') || lowerMessage.includes('carnê') || lowerMessage.includes('carne')) {
        return 'parcelamento'
    }

    // Investimento
    if (lowerMessage.includes('investir') || lowerMessage.includes('investimento') || lowerMessage.includes('ações') || lowerMessage.includes('acoes')) {
        return 'investimento'
    }

    return null
}
