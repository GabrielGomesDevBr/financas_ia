#!/bin/bash

# Script to replace console.error with logger.error in all TypeScript files
# This maintains error logging while using professional logger

find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/__tests__/*" | while read file; do
  # Skip files that are tests or already use logger properly
  if grep -q "console\.error" "$file"; then
    # Check if file imports logger
    if ! grep -q "import.*logger.*from.*@/lib/logger" "$file"; then
      # File has console.error but no logger import - skip for manual review
      echo "⚠️  Skipped (no logger import): $file"
    else
      # Replace console.error with logger.error
      sed -i "s/console\.error(/logger.error(/g" "$file"
      echo "✅ Updated: $file"
    fi
  fi
done

echo ""
echo "Done! Files with console.error but no logger import need manual review."
