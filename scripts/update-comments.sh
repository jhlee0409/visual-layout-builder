#!/bin/bash

# v2 코멘트 및 문자열 텍스트 수정 스크립트
set -e

cd "$(dirname "$0")/.."

echo "=== 코멘트 및 문자열 텍스트 수정 시작 ==="

# 코멘트의 "V2" 텍스트 제거 (일반적인 패턴)
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/scripts/*" \
  -exec sed -i '' 's/ V2 / /g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/scripts/*" \
  -exec sed -i '' 's/ V2:/:/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/scripts/*" \
  -exec sed -i '' 's/Schema V2/Schema/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/scripts/*" \
  -exec sed -i '' 's/Visual Layout Builder V2/Visual Layout Builder/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/scripts/*" \
  -exec sed -i '' 's/(V2)//g' {} \;

# localStorage 키 이름 수정
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/scripts/*" \
  -exec sed -i '' 's/laylder-layout-store-v2/laylder-layout-store/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/scripts/*" \
  -exec sed -i '' 's/laylder-theme-store-v2/laylder-theme-store/g' {} \;

# 특정 문자열 패턴 수정
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/scripts/*" \
  -exec sed -i '' 's/Konva Canvas V2/Konva Canvas/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/scripts/*" \
  -exec sed -i '' 's/Canvas V2/Canvas/g' {} \;

# E2E 테스트 describe 문자열 수정
find . -type f -name "*.spec.ts" \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' "s/'V2 /'/" {} \;

find . -type f -name "*.spec.ts" \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' "s/V2 페이지/페이지/g" {} \;

# URL 경로 수정
find . -type f -name "*.spec.ts" \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' "s|page.goto('/v2')|page.goto('/')|g" {} \;

echo "=== 코멘트 및 문자열 텍스트 수정 완료 ==="
