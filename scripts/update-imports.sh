#!/bin/bash

# v2 import 경로 수정 스크립트
set -e

cd "$(dirname "$0")/.."

echo "=== import 경로 수정 시작 ==="

# 모든 TypeScript/TSX 파일에서 import 경로의 -v2 제거
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/scripts/remove-v2-names.sh" \
  -not -path "*/scripts/update-imports.sh" \
  -exec sed -i '' 's|from "@/types/schema-v2"|from "@/types/schema"|g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's|from "@/lib/\([^"]*\)-v2"|from "@/lib/\1"|g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's|from "@/store/\([^"]*\)-v2"|from "@/store/\1"|g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's|from "@/components/\([^"]*\)-v2"|from "@/components/\1"|g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's|from "\.\./types/schema-v2"|from "../types/schema"|g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's|from "\.\./lib/\([^"]*\)-v2"|from "../lib/\1"|g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's|from "\./\([^"]*\)V2"|from "./\1"|g' {} \;

# index.ts 파일의 export 수정
find . -type f -name "index.ts" \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's|from "\./\([^"]*\)V2"|from "./\1"|g' {} \;

find . -type f -name "index.ts" \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's|export { \([^}]*\)V2 }|export { \1 }|g' {} \;

echo "=== import 경로 수정 완료 ==="
