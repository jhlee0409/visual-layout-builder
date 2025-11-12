#!/usr/bin/env tsx
/**
 * 브레이크포인트 유효성 검사 테스트
 *
 * 커스텀 브레이크포인트로 스키마를 생성하고 유효성 검사가 올바르게 작동하는지 확인
 */

import { validateSchema, formatValidationResult } from "../lib/schema-validation"
import type { LaydlerSchema } from "../types/schema"

// 테스트 1: 표준 3종 브레이크포인트 (mobile/tablet/desktop)
const standardSchema: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "Header",
      semanticTag: "header",
      positioning: { type: "fixed", position: { top: 0 } },
      layout: { type: "flex" },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 6, gridRows: 24 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
    { name: "desktop", minWidth: 1024, gridCols: 12, gridRows: 20 },
  ],
  layouts: {
    mobile: { structure: "vertical", components: ["c1"] },
    tablet: { structure: "vertical", components: ["c1"] },
    desktop: { structure: "vertical", components: ["c1"] },
  },
}

// 테스트 2: 커스텀 2종 브레이크포인트 (small/large)
const customSchema: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "Header",
      semanticTag: "header",
      positioning: { type: "fixed", position: { top: 0 } },
      layout: { type: "flex" },
    },
  ],
  breakpoints: [
    { name: "small", minWidth: 0, gridCols: 4, gridRows: 20 },
    { name: "large", minWidth: 1200, gridCols: 16, gridRows: 16 },
  ],
  layouts: {
    small: { structure: "vertical", components: ["c1"] },
    large: { structure: "vertical", components: ["c1"] },
  },
}

// 테스트 3: 레이아웃 누락 (에러 발생 예상)
const missingLayoutSchema: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "Header",
      semanticTag: "header",
      positioning: { type: "fixed", position: { top: 0 } },
      layout: { type: "flex" },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 6, gridRows: 24 },
    { name: "tablet", minWidth: 768, gridCols: 8, gridRows: 20 },
  ],
  layouts: {
    mobile: { structure: "vertical", components: ["c1"] },
    // tablet 레이아웃 누락!
  },
}

// 테스트 4: 브레이크포인트 중복 (에러 발생 예상)
const duplicateBreakpointSchema: LaydlerSchema = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "Header",
      semanticTag: "header",
      positioning: { type: "fixed", position: { top: 0 } },
      layout: { type: "flex" },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0, gridCols: 6, gridRows: 24 },
    { name: "mobile", minWidth: 768, gridCols: 8, gridRows: 20 }, // 중복!
  ],
  layouts: {
    mobile: { structure: "vertical", components: ["c1"] },
  },
}

console.log("=".repeat(80))
console.log("브레이크포인트 유효성 검사 테스트")
console.log("=".repeat(80))

console.log("\n[테스트 1] 표준 3종 브레이크포인트 (mobile/tablet/desktop)")
console.log("-".repeat(80))
const result1 = validateSchema(standardSchema)
console.log(formatValidationResult(result1))

console.log("\n[테스트 2] 커스텀 2종 브레이크포인트 (small/large)")
console.log("-".repeat(80))
const result2 = validateSchema(customSchema)
console.log(formatValidationResult(result2))

console.log("\n[테스트 3] 레이아웃 누락 (tablet 레이아웃 없음)")
console.log("-".repeat(80))
const result3 = validateSchema(missingLayoutSchema)
console.log(formatValidationResult(result3))

console.log("\n[테스트 4] 브레이크포인트 이름 중복")
console.log("-".repeat(80))
const result4 = validateSchema(duplicateBreakpointSchema)
console.log(formatValidationResult(result4))

console.log("\n" + "=".repeat(80))
console.log("테스트 완료")
console.log("=".repeat(80))
