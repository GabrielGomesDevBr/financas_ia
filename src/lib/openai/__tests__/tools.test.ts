import { describe, it, expect } from 'vitest'
import { tools } from '../tools'

describe('OpenAI Tools', () => {
    describe('Tools Array', () => {
        it('exports tools array', () => {
            expect(tools).toBeDefined()
            expect(Array.isArray(tools)).toBe(true)
        })

        it('has exactly 7 tools', () => {
            expect(tools).toHaveLength(7)
        })

        it('all tools have type "function"', () => {
            tools.forEach(tool => {
                expect(tool.type).toBe('function')
            })
        })

        it('all tools have function property', () => {
            tools.forEach(tool => {
                expect(tool).toHaveProperty('function')
                expect(tool.function).toBeDefined()
            })
        })

        it('all functions have name', () => {
            tools.forEach(tool => {
                expect(tool.function).toHaveProperty('name')
                expect(typeof tool.function.name).toBe('string')
                expect(tool.function.name.length).toBeGreaterThan(0)
            })
        })

        it('all functions have description', () => {
            tools.forEach(tool => {
                expect(tool.function).toHaveProperty('description')
                expect(typeof tool.function.description).toBe('string')
                expect(tool.function.description.length).toBeGreaterThan(10)
            })
        })

        it('all functions have parameters', () => {
            tools.forEach(tool => {
                expect(tool.function).toHaveProperty('parameters')
                expect(tool.function.parameters).toBeDefined()
            })
        })
    })

    describe('Tool Names', () => {
        const expectedTools = [
            'registrar_transacao',
            'buscar_transacoes',
            'criar_orcamento',
            'criar_meta',
            'resumo_financeiro',
            'explicar_funcionalidade',
            'deletar_transacao'
        ]

        it('has all expected tool names', () => {
            const toolNames = tools.map(t => t.function.name)
            expectedTools.forEach(name => {
                expect(toolNames).toContain(name)
            })
        })

        it('all tool names are unique', () => {
            const names = tools.map(t => t.function.name)
            const uniqueNames = new Set(names)
            expect(uniqueNames.size).toBe(names.length)
        })

        it('all tool names use snake_case', () => {
            tools.forEach(tool => {
                expect(tool.function.name).toMatch(/^[a-z]+(_[a-z]+)*$/)
            })
        })
    })

    describe('registrar_transacao tool', () => {
        const tool = tools.find(t => t.function.name === 'registrar_transacao')!

        it('exists', () => {
            expect(tool).toBeDefined()
        })

        it('has descriptive description', () => {
            expect(tool.function.description).toContain('Registra')
            expect(tool.function.description.toLowerCase()).toContain('despesa')
            expect(tool.function.description.toLowerCase()).toContain('receita')
        })

        it('has correct parameter structure', () => {
            expect(tool.function.parameters.type).toBe('object')
            expect(tool.function.parameters).toHaveProperty('properties')
            expect(tool.function.parameters).toHaveProperty('required')
        })

        it('has all required parameters', () => {
            const properties = tool.function.parameters.properties
            expect(properties).toHaveProperty('type')
            expect(properties).toHaveProperty('amount')
            expect(properties).toHaveProperty('description')
            expect(properties).toHaveProperty('category')
        })

        it('has optional parameters', () => {
            const properties = tool.function.parameters.properties
            expect(properties).toHaveProperty('subcategory')
            expect(properties).toHaveProperty('date')
        })

        it('requires correct fields', () => {
            const required = tool.function.parameters.required
            expect(required).toContain('type')
            expect(required).toContain('amount')
            expect(required).toContain('description')
            expect(required).toContain('category')
        })

        it('type parameter has correct enum', () => {
            const typeParam = tool.function.parameters.properties.type
            expect(typeParam.enum).toEqual(['expense', 'income'])
        })

        it('amount is number type', () => {
            const amountParam = tool.function.parameters.properties.amount
            expect(amountParam.type).toBe('number')
        })

        it('description is string type', () => {
            const descParam = tool.function.parameters.properties.description
            expect(descParam.type).toBe('string')
        })
    })

    describe('buscar_transacoes tool', () => {
        const tool = tools.find(t => t.function.name === 'buscar_transacoes')!

        it('exists', () => {
            expect(tool).toBeDefined()
        })

        it('has search-related description', () => {
            expect(tool.function.description.toLowerCase()).toContain('busca')
        })

        it('has filter parameters', () => {
            const properties = tool.function.parameters.properties
            expect(properties).toHaveProperty('type')
            expect(properties).toHaveProperty('category')
            expect(properties).toHaveProperty('start_date')
            expect(properties).toHaveProperty('end_date')
            expect(properties).toHaveProperty('limit')
        })

        it('type filter includes "all" option', () => {
            const typeParam = tool.function.parameters.properties.type
            expect(typeParam.enum).toContain('all')
            expect(typeParam.enum).toContain('expense')
            expect(typeParam.enum).toContain('income')
        })

        it('has no required parameters', () => {
            const required = tool.function.parameters.required
            expect(required === undefined || required.length === 0).toBe(true)
        })

        it('limit is number type', () => {
            const limitParam = tool.function.parameters.properties.limit
            expect(limitParam.type).toBe('number')
        })
    })

    describe('criar_orcamento tool', () => {
        const tool = tools.find(t => t.function.name === 'criar_orcamento')!

        it('exists', () => {
            expect(tool).toBeDefined()
        })

        it('has budget-related description', () => {
            expect(tool.function.description.toLowerCase()).toContain('orçamento')
        })

        it('has required parameters', () => {
            const properties = tool.function.parameters.properties
            expect(properties).toHaveProperty('category')
            expect(properties).toHaveProperty('amount')
        })

        it('has period parameter', () => {
            const properties = tool.function.parameters.properties
            expect(properties).toHaveProperty('period')
        })

        it('period has correct enum values', () => {
            const periodParam = tool.function.parameters.properties.period
            expect(periodParam.enum).toEqual(['weekly', 'monthly', 'yearly'])
        })

        it('requires category and amount', () => {
            const required = tool.function.parameters.required
            expect(required).toContain('category')
            expect(required).toContain('amount')
        })
    })

    describe('criar_meta tool', () => {
        const tool = tools.find(t => t.function.name === 'criar_meta')!

        it('exists', () => {
            expect(tool).toBeDefined()
        })

        it('has goal-related description', () => {
            expect(tool.function.description.toLowerCase()).toContain('meta')
        })

        it('has goal parameters', () => {
            const properties = tool.function.parameters.properties
            expect(properties).toHaveProperty('name')
            expect(properties).toHaveProperty('target_amount')
            expect(properties).toHaveProperty('deadline')
            expect(properties).toHaveProperty('category')
        })

        it('requires name and target_amount', () => {
            const required = tool.function.parameters.required
            expect(required).toContain('name')
            expect(required).toContain('target_amount')
        })

        it('deadline and category are optional', () => {
            const required = tool.function.parameters.required
            expect(required).not.toContain('deadline')
            expect(required).not.toContain('category')
        })
    })

    describe('resumo_financeiro tool', () => {
        const tool = tools.find(t => t.function.name === 'resumo_financeiro')!

        it('exists', () => {
            expect(tool).toBeDefined()
        })

        it('has summary-related description', () => {
            expect(tool.function.description.toLowerCase()).toContain('resumo')
        })

        it('has period parameter', () => {
            const properties = tool.function.parameters.properties
            expect(properties).toHaveProperty('period')
        })

        it('period has time range options', () => {
            const periodParam = tool.function.parameters.properties.period
            expect(periodParam.enum).toContain('week')
            expect(periodParam.enum).toContain('month')
            expect(periodParam.enum).toContain('year')
            expect(periodParam.enum).toContain('all')
        })

        it('has no required parameters', () => {
            const required = tool.function.parameters.required
            expect(required === undefined || required.length === 0).toBe(true)
        })
    })

    describe('explicar_funcionalidade tool', () => {
        const tool = tools.find(t => t.function.name === 'explicar_funcionalidade')!

        it('exists', () => {
            expect(tool).toBeDefined()
        })

        it('has explanation-related description', () => {
            expect(tool.function.description.toLowerCase()).toContain('explica')
        })

        it('has funcionalidade parameter', () => {
            const properties = tool.function.parameters.properties
            expect(properties).toHaveProperty('funcionalidade')
        })

        it('funcionalidade has feature options', () => {
            const funcParam = tool.function.parameters.properties.funcionalidade
            expect(funcParam.enum).toContain('geral')
            expect(funcParam.enum).toContain('transacoes')
            expect(funcParam.enum).toContain('orcamentos')
            expect(funcParam.enum).toContain('metas')
            expect(funcParam.enum).toContain('relatorios')
            expect(funcParam.enum).toContain('chat')
        })

        it('has tipo parameter', () => {
            const properties = tool.function.parameters.properties
            expect(properties).toHaveProperty('tipo')
        })

        it('tipo has content type options', () => {
            const tipoParam = tool.function.parameters.properties.tipo
            expect(tipoParam.enum).toContain('tutorial')
            expect(tipoParam.enum).toContain('dica')
            expect(tipoParam.enum).toContain('explicacao')
        })

        it('requires funcionalidade', () => {
            const required = tool.function.parameters.required
            expect(required).toContain('funcionalidade')
        })
    })

    describe('deletar_transacao tool', () => {
        const tool = tools.find(t => t.function.name === 'deletar_transacao')!

        it('exists', () => {
            expect(tool).toBeDefined()
        })

        it('has delete-related description', () => {
            expect(tool.function.description.toLowerCase()).toContain('apag')
        })

        it('has search parameters', () => {
            const properties = tool.function.parameters.properties
            expect(properties).toHaveProperty('description')
            expect(properties).toHaveProperty('amount')
            expect(properties).toHaveProperty('date')
        })

        it('requires description', () => {
            const required = tool.function.parameters.required
            expect(required).toContain('description')
            expect(required).toHaveLength(1)
        })

        it('amount and date are optional', () => {
            const required = tool.function.parameters.required
            expect(required).not.toContain('amount')
            expect(required).not.toContain('date')
        })
    })

    describe('Parameter Types', () => {
        it('all parameters have type defined', () => {
            tools.forEach(tool => {
                const properties = tool.function.parameters.properties
                Object.values(properties).forEach((param: any) => {
                    expect(param).toHaveProperty('type')
                    expect(['string', 'number', 'boolean', 'object', 'array']).toContain(param.type)
                })
            })
        })

        it('all parameters have description', () => {
            tools.forEach(tool => {
                const properties = tool.function.parameters.properties
                Object.values(properties).forEach((param: any) => {
                    expect(param).toHaveProperty('description')
                    expect(typeof param.description).toBe('string')
                    expect(param.description.length).toBeGreaterThan(5)
                })
            })
        })

        it('enum parameters are strings', () => {
            tools.forEach(tool => {
                const properties = tool.function.parameters.properties
                Object.values(properties).forEach((param: any) => {
                    if (param.enum) {
                        expect(param.type).toBe('string')
                        expect(Array.isArray(param.enum)).toBe(true)
                        expect(param.enum.length).toBeGreaterThan(0)
                    }
                })
            })
        })
    })

    describe('Required Fields Validation', () => {
        it('required fields exist in properties', () => {
            tools.forEach(tool => {
                const required = tool.function.parameters.required || []
                const properties = Object.keys(tool.function.parameters.properties)

                required.forEach(field => {
                    expect(properties).toContain(field)
                })
            })
        })

        it('required is array or undefined', () => {
            tools.forEach(tool => {
                const required = tool.function.parameters.required
                if (required !== undefined) {
                    expect(Array.isArray(required)).toBe(true)
                }
            })
        })
    })

    describe('OpenAI Compatibility', () => {
        it('matches OpenAI function calling format', () => {
            tools.forEach(tool => {
                expect(tool).toHaveProperty('type')
                expect(tool).toHaveProperty('function')
                expect(tool.function).toHaveProperty('name')
                expect(tool.function).toHaveProperty('description')
                expect(tool.function).toHaveProperty('parameters')
                expect(tool.function.parameters).toHaveProperty('type')
                expect(tool.function.parameters.type).toBe('object')
            })
        })

        it('can be serialized to JSON', () => {
            expect(() => JSON.stringify(tools)).not.toThrow()
        })

        it('JSON serialization preserves structure', () => {
            const json = JSON.stringify(tools)
            const parsed = JSON.parse(json)
            expect(parsed).toHaveLength(tools.length)
            expect(parsed[0]).toHaveProperty('type')
            expect(parsed[0]).toHaveProperty('function')
        })
    })

    describe('Tool Coverage', () => {
        it('covers transaction operations', () => {
            const names = tools.map(t => t.function.name)
            expect(names).toContain('registrar_transacao')
            expect(names).toContain('buscar_transacoes')
            expect(names).toContain('deletar_transacao')
        })

        it('covers budget operations', () => {
            const names = tools.map(t => t.function.name)
            expect(names).toContain('criar_orcamento')
        })

        it('covers goal operations', () => {
            const names = tools.map(t => t.function.name)
            expect(names).toContain('criar_meta')
        })

        it('covers reporting', () => {
            const names = tools.map(t => t.function.name)
            expect(names).toContain('resumo_financeiro')
        })

        it('covers help/documentation', () => {
            const names = tools.map(t => t.function.name)
            expect(names).toContain('explicar_funcionalidade')
        })
    })
})
