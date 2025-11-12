#!/bin/bash

# v2 함수명/변수명/타입명 수정 스크립트
set -e

cd "$(dirname "$0")/.."

echo "=== 함수명/변수명/타입명 수정 시작 ==="

# 타입명 변경
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/LaydlerSchemaV2/LaydlerSchema/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/GenerationPackageV2/GenerationPackage/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/GenerationResultV2/GenerationResult/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/PromptTemplateV2/PromptTemplate/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/LayoutStateV2/LayoutState/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/ThemeStateV2/ThemeState/g' {} \;

# 함수명 변경
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/generatePromptV2/generatePrompt/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/generateSchemaSummaryV2/generateSchemaSummary/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/estimateTokenCountV2/estimateTokenCount/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/getRecommendedModelV2/getRecommendedModel/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/getTemplateV2/getTemplate/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/validateSchemaV2/validateSchema/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/normalizeSchemaV2/normalizeSchema/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/createEmptySchemaV2/createEmptySchema/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/cloneSchemaV2/cloneSchema/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/isValidSchemaV2/isValidSchema/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/sampleSchemasV2/sampleSchemas/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/defaultGenerationPackageV2/defaultGenerationPackage/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/reactTailwindTemplateV2/reactTailwindTemplate/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/templateRegistryV2/templateRegistry/g' {} \;

# 컴포넌트명 변경
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/\bBreakpointSwitcherV2\b/BreakpointSwitcher/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/\bLibraryPanelV2\b/LibraryPanel/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/\bLayersTreeV2\b/LayersTree/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/\bKonvaCanvasV2\b/KonvaCanvas/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/\bCanvasV2\b/Canvas/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/\bComponentNodeV2\b/ComponentNode/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/\bPropertiesPanelV2\b/PropertiesPanel/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/\bExportModalV2\b/ExportModal/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/\bThemeSelectorV2\b/ThemeSelector/g' {} \;

# 스토어 훅명 변경
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/useLayoutStoreV2/useLayoutStore/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/useThemeStoreV2/useThemeStore/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/useCurrentLayoutV2/useCurrentLayout/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/useCurrentBreakpointConfigV2/useCurrentBreakpointConfig/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/useSelectedComponentV2/useSelectedComponent/g' {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -exec sed -i '' 's/useComponentsInCurrentLayoutV2/useComponentsInCurrentLayout/g' {} \;

echo "=== 함수명/변수명/타입명 수정 완료 ==="
