#!/bin/bash

# v2 제거 스크립트
# 1단계: 파일명과 디렉토리명 변경

set -e

cd "$(dirname "$0")/.."

echo "=== v2 제거 작업 시작 ==="

# 1. lib 파일 리네임
echo "1. lib 파일 리네임..."
git mv lib/ai-service-v2.ts lib/ai-service.ts 2>/dev/null || true
git mv lib/code-generator-v2.ts lib/code-generator.ts 2>/dev/null || true
git mv lib/component-library-v2.ts lib/component-library.ts 2>/dev/null || true
git mv lib/file-exporter-v2.ts lib/file-exporter.ts 2>/dev/null || true
git mv lib/prompt-generator-v2.ts lib/prompt-generator.ts 2>/dev/null || true
git mv lib/prompt-templates-v2.ts lib/prompt-templates.ts 2>/dev/null || true
git mv lib/sample-data-v2.ts lib/sample-data.ts 2>/dev/null || true
git mv lib/schema-utils-v2.ts lib/schema-utils.ts 2>/dev/null || true
git mv lib/schema-validation-v2.ts lib/schema-validation.ts 2>/dev/null || true
git mv lib/theme-system-v2.ts lib/theme-system.ts 2>/dev/null || true

# 2. store 파일 리네임
echo "2. store 파일 리네임..."
git mv store/layout-store-v2.ts store/layout-store.ts 2>/dev/null || true
git mv store/theme-store-v2.ts store/theme-store.ts 2>/dev/null || true

# 3. 컴포넌트 디렉토리 리네임
echo "3. 컴포넌트 디렉토리 리네임..."
git mv components/breakpoint-panel-v2 components/breakpoint-panel 2>/dev/null || true
git mv components/canvas-v2 components/canvas 2>/dev/null || true
git mv components/export-modal-v2 components/export-modal 2>/dev/null || true
git mv components/layers-tree-v2 components/layers-tree 2>/dev/null || true
git mv components/library-panel-v2 components/library-panel 2>/dev/null || true
git mv components/properties-panel-v2 components/properties-panel 2>/dev/null || true
git mv components/theme-selector-v2 components/theme-selector 2>/dev/null || true

# 4. 컴포넌트 파일명 리네임 (이미 디렉토리가 이동했으므로 새 경로에서)
echo "4. 컴포넌트 파일명 리네임..."
git mv components/breakpoint-panel/BreakpointSwitcherV2.tsx components/breakpoint-panel/BreakpointSwitcher.tsx 2>/dev/null || true
git mv components/canvas/CanvasV2.tsx components/canvas/Canvas.tsx 2>/dev/null || true
git mv components/canvas/ComponentNodeV2.tsx components/canvas/ComponentNode.tsx 2>/dev/null || true
git mv components/canvas/KonvaCanvasV2.tsx components/canvas/KonvaCanvas.tsx 2>/dev/null || true
git mv components/export-modal/ExportModalV2.tsx components/export-modal/ExportModal.tsx 2>/dev/null || true
git mv components/layers-tree/LayersTreeV2.tsx components/layers-tree/LayersTree.tsx 2>/dev/null || true
git mv components/library-panel/LibraryPanelV2.tsx components/library-panel/LibraryPanel.tsx 2>/dev/null || true
git mv components/properties-panel/PropertiesPanelV2.tsx components/properties-panel/PropertiesPanel.tsx 2>/dev/null || true
git mv components/theme-selector/ThemeSelectorV2.tsx components/theme-selector/ThemeSelector.tsx 2>/dev/null || true

# 5. E2E 테스트 파일 리네임
echo "5. E2E 테스트 파일 리네임..."
git mv e2e/v2-01-basic-flow.spec.ts e2e/01-basic-flow.spec.ts 2>/dev/null || true
git mv e2e/v2-02-panels.spec.ts e2e/02-panels.spec.ts 2>/dev/null || true
git mv e2e/v2-03-breakpoints.spec.ts e2e/03-breakpoints.spec.ts 2>/dev/null || true
git mv e2e/v2-04-export.spec.ts e2e/04-export.spec.ts 2>/dev/null || true

# 6. 스크립트 파일 리네임
echo "6. 스크립트 파일 리네임..."
git mv scripts/test-code-generator-v2.ts scripts/test-code-generator.ts 2>/dev/null || true
git mv scripts/test-file-exporter-v2.ts scripts/test-file-exporter.ts 2>/dev/null || true
git mv scripts/test-prompt-generator-v2.ts scripts/test-prompt-generator.ts 2>/dev/null || true
git mv scripts/test-schema-v2-integration.ts scripts/test-schema-integration.ts 2>/dev/null || true
git mv scripts/validate-schema-v2.ts scripts/validate-schema.ts 2>/dev/null || true

echo "=== 파일명 변경 완료 ==="
echo "다음 단계: import 경로 수정 및 함수명 변경"
