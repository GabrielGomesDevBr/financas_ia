import { describe, it, expect } from 'vitest'
import { personalities, getPersonalityPrompt, Personality } from '../personalities'

describe('Personalities', () => {
    describe('Personality Structure', () => {
        it('exports personalities object', () => {
            expect(personalities).toBeDefined()
            expect(typeof personalities).toBe('object')
        })

        it('has all expected personalities', () => {
            const expectedPersonalities = ['padrao', 'julius', 'severina', 'augusto', 'luna', 'marcos']
            expectedPersonalities.forEach(key => {
                expect(personalities).toHaveProperty(key)
            })
        })

        it('has exactly 6 personalities', () => {
            expect(Object.keys(personalities)).toHaveLength(6)
        })
    })

    describe('Individual Personalities', () => {
        const requiredProperties = ['name', 'description', 'icon', 'systemPrompt']

        Object.entries(personalities).forEach(([key, personality]) => {
            describe(`${key} personality`, () => {
                it('has all required properties', () => {
                    requiredProperties.forEach(prop => {
                        expect(personality).toHaveProperty(prop)
                        expect((personality as any)[prop]).toBeDefined()
                    })
                })

                it('has valid name', () => {
                    expect(typeof personality.name).toBe('string')
                    expect(personality.name.length).toBeGreaterThan(0)
                })

                it('has valid description', () => {
                    expect(typeof personality.description).toBe('string')
                    expect(personality.description.length).toBeGreaterThan(0)
                })

                it('has valid icon', () => {
                    expect(typeof personality.icon).toBe('string')
                    expect(personality.icon.length).toBeGreaterThan(0)
                })

                it('has non-empty system prompt', () => {
                    expect(typeof personality.systemPrompt).toBe('string')
                    expect(personality.systemPrompt.length).toBeGreaterThan(50)
                })
            })
        })
    })

    describe('padrao personality', () => {
        it('has correct properties', () => {
            expect(personalities.padrao.name).toBe('Assistente Padrão')
            expect(personalities.padrao.icon).toBe('🤖')
        })

        it('has professional tone in prompt', () => {
            const prompt = personalities.padrao.systemPrompt
            expect(prompt.toLowerCase()).toContain('assistente')
            expect(prompt.toLowerCase()).toContain('financeiro')
        })

        it('emphasizes being helpful', () => {
            const prompt = personalities.padrao.systemPrompt
            expect(prompt.toLowerCase()).toContain('útil')
        })
    })

    describe('julius personality', () => {
        it('has correct properties', () => {
            expect(personalities.julius.name).toBe('Julius')
            expect(personalities.julius.icon).toBe('🤑')
        })

        it('includes iconic catchphrases', () => {
            const prompt = personalities.julius.systemPrompt
            expect(prompt).toContain('Rockefeller')
            expect(prompt).toContain('desperdício')
            expect(prompt).toContain('Apaga essa luz')
        })

        it('emphasizes saving money', () => {
            const prompt = personalities.julius.systemPrompt
            expect(prompt.toLowerCase()).toContain('econom')
            expect(prompt.toLowerCase()).toContain('gasto')
        })

        it('uses caps lock for emphasis', () => {
            const prompt = personalities.julius.systemPrompt
            expect(prompt).toContain('CAPS LOCK')
            expect(prompt).toMatch(/[A-Z]{3,}/) // Has words in all caps
        })
    })

    describe('severina personality', () => {
        it('has correct properties', () => {
            expect(personalities.severina.name).toBe('Dra. Severina')
            expect(personalities.severina.icon).toBe('😠')
        })

        it('has strict tone', () => {
            const prompt = personalities.severina.systemPrompt
            expect(prompt.toLowerCase()).toContain('brava')
            expect(prompt.toLowerCase()).toContain('disciplina')
        })

        it('emphasizes direct communication', () => {
            const prompt = personalities.severina.systemPrompt
            expect(prompt.toLowerCase()).toContain('diret')
        })
    })

    describe('augusto personality', () => {
        it('has correct properties', () => {
            expect(personalities.augusto.name).toBe('Dr. Augusto')
            expect(personalities.augusto.icon).toBe('📊')
        })

        it('has technical approach', () => {
            const prompt = personalities.augusto.systemPrompt
            expect(prompt.toLowerCase()).toContain('técnico')
            expect(prompt.toLowerCase()).toContain('preciso')
        })

        it('emphasizes data and analysis', () => {
            const prompt = personalities.augusto.systemPrompt
            expect(prompt.toLowerCase()).toContain('dados')
            expect(prompt.toLowerCase()).toContain('análise')
        })

        it('mentions professional experience', () => {
            const prompt = personalities.augusto.systemPrompt
            expect(prompt).toContain('20 anos')
        })
    })

    describe('luna personality', () => {
        it('has correct properties', () => {
            expect(personalities.luna.name).toBe('Luna')
            expect(personalities.luna.icon).toBe('🌟')
        })

        it('has positive tone', () => {
            const prompt = personalities.luna.systemPrompt
            expect(prompt.toLowerCase()).toContain('positiv')
            expect(prompt.toLowerCase()).toContain('motivador')
        })

        it('emphasizes encouragement', () => {
            const prompt = personalities.luna.systemPrompt
            expect(prompt.toLowerCase()).toContain('celebra')
            expect(prompt.toLowerCase()).toContain('encorajador')
        })

        it('mentions emoji usage', () => {
            const prompt = personalities.luna.systemPrompt
            expect(prompt.toLowerCase()).toContain('emoji')
        })
    })

    describe('marcos personality', () => {
        it('has correct properties', () => {
            expect(personalities.marcos.name).toBe('Marcos')
            expect(personalities.marcos.icon).toBe('😏')
        })

        it('has sarcastic tone', () => {
            const prompt = personalities.marcos.systemPrompt
            expect(prompt.toLowerCase()).toContain('sarcástico')
            expect(prompt.toLowerCase()).toContain('irônico')
        })

        it('balances humor with usefulness', () => {
            const prompt = personalities.marcos.systemPrompt
            expect(prompt.toLowerCase()).toContain('engraçad')
            expect(prompt.toLowerCase()).toContain('útil')
        })

        it('mentions common phrases', () => {
            const prompt = personalities.marcos.systemPrompt
            expect(prompt).toContain('né?')
            expect(prompt).toContain('tá bom então')
        })
    })

    describe('getPersonalityPrompt function', () => {
        it('returns correct prompt for valid personality key', () => {
            const prompt = getPersonalityPrompt('padrao')
            expect(prompt).toBe(personalities.padrao.systemPrompt)
        })

        it('returns julius prompt correctly', () => {
            const prompt = getPersonalityPrompt('julius')
            expect(prompt).toBe(personalities.julius.systemPrompt)
            expect(prompt).toContain('Rockefeller')
        })

        it('returns severina prompt correctly', () => {
            const prompt = getPersonalityPrompt('severina')
            expect(prompt).toBe(personalities.severina.systemPrompt)
        })

        it('returns augusto prompt correctly', () => {
            const prompt = getPersonalityPrompt('augusto')
            expect(prompt).toBe(personalities.augusto.systemPrompt)
        })

        it('returns luna prompt correctly', () => {
            const prompt = getPersonalityPrompt('luna')
            expect(prompt).toBe(personalities.luna.systemPrompt)
        })

        it('returns marcos prompt correctly', () => {
            const prompt = getPersonalityPrompt('marcos')
            expect(prompt).toBe(personalities.marcos.systemPrompt)
        })

        it('falls back to padrao for invalid personality key', () => {
            const prompt = getPersonalityPrompt('invalid_key')
            expect(prompt).toBe(personalities.padrao.systemPrompt)
        })

        it('falls back to padrao for empty string', () => {
            const prompt = getPersonalityPrompt('')
            expect(prompt).toBe(personalities.padrao.systemPrompt)
        })

        it('falls back to padrao for undefined personality', () => {
            const prompt = getPersonalityPrompt('nonexistent')
            expect(prompt).toBe(personalities.padrao.systemPrompt)
        })

        it('returns string type', () => {
            const prompt = getPersonalityPrompt('padrao')
            expect(typeof prompt).toBe('string')
        })

        it('returns non-empty string', () => {
            const prompt = getPersonalityPrompt('padrao')
            expect(prompt.length).toBeGreaterThan(0)
        })
    })

    describe('Personality Characteristics', () => {
        it('all personalities have unique names', () => {
            const names = Object.values(personalities).map(p => p.name)
            const uniqueNames = new Set(names)
            expect(uniqueNames.size).toBe(names.length)
        })

        it('all personalities have unique icons', () => {
            const icons = Object.values(personalities).map(p => p.icon)
            const uniqueIcons = new Set(icons)
            expect(uniqueIcons.size).toBe(icons.length)
        })

        it('all personalities have unique descriptions', () => {
            const descriptions = Object.values(personalities).map(p => p.description)
            const uniqueDescriptions = new Set(descriptions)
            expect(uniqueDescriptions.size).toBe(descriptions.length)
        })

        it('all system prompts are substantial', () => {
            Object.values(personalities).forEach(personality => {
                expect(personality.systemPrompt.length).toBeGreaterThan(100)
            })
        })

        it('all system prompts contain "você"', () => {
            Object.values(personalities).forEach(personality => {
                expect(personality.systemPrompt.toLowerCase()).toContain('você')
            })
        })
    })

    describe('Edge Cases', () => {
        it('handles null as personality key', () => {
            const prompt = getPersonalityPrompt(null as any)
            expect(prompt).toBe(personalities.padrao.systemPrompt)
        })

        it('handles undefined as personality key', () => {
            const prompt = getPersonalityPrompt(undefined as any)
            expect(prompt).toBe(personalities.padrao.systemPrompt)
        })

        it('handles numeric key', () => {
            const prompt = getPersonalityPrompt(123 as any)
            expect(prompt).toBe(personalities.padrao.systemPrompt)
        })

        it('handles special characters in key', () => {
            const prompt = getPersonalityPrompt('!!!###')
            expect(prompt).toBe(personalities.padrao.systemPrompt)
        })

        it('is case-sensitive for keys', () => {
            const prompt = getPersonalityPrompt('PADRAO')
            expect(prompt).toBe(personalities.padrao.systemPrompt) // Falls back to padrao
        })
    })

    describe('Type Safety', () => {
        it('Personality interface matches actual structure', () => {
            Object.values(personalities).forEach(personality => {
                const p: Personality = personality
                expect(p.name).toBeDefined()
                expect(p.description).toBeDefined()
                expect(p.icon).toBeDefined()
                expect(p.systemPrompt).toBeDefined()
            })
        })

        it('all values match Personality type', () => {
            Object.values(personalities).forEach(personality => {
                expect(typeof personality.name).toBe('string')
                expect(typeof personality.description).toBe('string')
                expect(typeof personality.icon).toBe('string')
                expect(typeof personality.systemPrompt).toBe('string')
            })
        })
    })
})
