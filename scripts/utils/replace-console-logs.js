#!/usr/bin/env node

/**
 * Script to replace console.log statements with logger
 * Usage: node scripts/replace-console-logs.js
 */

const fs = require('fs')
const path = require('path')

const filesToClean = [
    'src/app/api/chat/route.ts',
    'src/app/api/user/me/route.ts',
    'src/app/api/family/create/route.ts',
    'src/app/(dashboard)/transactions/page.tsx',
    'src/components/layout/Header.tsx',
]

const replacements = [
    // Import logger
    {
        pattern: /^(import .* from .*\n)/m,
        replacement: "$1import { logger } from '@/lib/logger'\n",
        once: true,
    },
    // Replace console.log
    {
        pattern: /console\.log\(\s*['"`]\[([^\]]+)\][^'"`]*['"`]\s*,?\s*(.*?)\)/g,
        replacement: "logger.debug('$1', $2)",
    },
    // Replace console.error
    {
        pattern: /console\.error\(\s*['"`]\[([^\]]+)\][^'"`]*['"`]\s*,?\s*(.*?)\)/g,
        replacement: "logger.error('$1', $2)",
    },
    // Replace simple console.log without context
    {
        pattern: /console\.log\((.*?)\)/g,
        replacement: "logger.debug('App', $1)",
    },
    // Replace simple console.error without context
    {
        pattern: /console\.error\((.*?)\)/g,
        replacement: "logger.error('App', $1)",
    },
]

filesToClean.forEach((file) => {
    const filePath = path.join(process.cwd(), file)

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${file}`)
        return
    }

    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false

    // Check if logger is already imported
    const hasLoggerImport = content.includes("from '@/lib/logger'")

    if (!hasLoggerImport && content.includes('console.')) {
        // Add logger import after last import
        const lastImportMatch = content.match(/^import .* from .*$/gm)
        if (lastImportMatch) {
            const lastImport = lastImportMatch[lastImportMatch.length - 1]
            content = content.replace(lastImport, lastImport + "\nimport { logger } from '@/lib/logger'")
            modified = true
        }
    }

    // Apply replacements
    replacements.forEach((r) => {
        if (r.once && modified) return
        const newContent = content.replace(r.pattern, r.replacement)
        if (newContent !== content) {
            content = newContent
            modified = true
        }
    })

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8')
        console.log(`✅ Cleaned: ${file}`)
    } else {
        console.log(`⏭️  Skipped: ${file} (no changes needed)`)
    }
})

console.log('\n✨ Console.log cleanup complete!')
