/**
 * Schema V2 Validation Error Test
 *
 * 의도적으로 잘못된 스키마를 만들어 검증 로직이 제대로 에러를 잡는지 테스트
 */

import {
  validateSchemaV2,
  formatValidationResult,
} from "../lib/schema-validation-v2"
import type { LaydlerSchemaV2 } from "../types/schema-v2"

console.log("🔍 Testing Validation Error Detection\n")
console.log("=" .repeat(60))

// Test 1: 잘못된 Schema Version
console.log("\n📋 Test 1: Invalid Schema Version")
console.log("-".repeat(60))
const invalidVersion: LaydlerSchemaV2 = {
  schemaVersion: "1.0" as any,
  components: [
    {
      id: "c1",
      name: "TestComponent",
      semanticTag: "div",
      positioning: { type: "static" },
      layout: { type: "none" },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0 },
    { name: "tablet", minWidth: 768 },
    { name: "desktop", minWidth: 1024 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1"],
    },
    tablet: {
      structure: "vertical",
      components: ["c1"],
    },
    desktop: {
      structure: "vertical",
      components: ["c1"],
    },
  },
}
console.log(formatValidationResult(validateSchemaV2(invalidVersion)))

// Test 2: 중복된 Component ID
console.log("\n\n📋 Test 2: Duplicate Component IDs")
console.log("-".repeat(60))
const duplicateIds: LaydlerSchemaV2 = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "Component1",
      semanticTag: "div",
      positioning: { type: "static" },
      layout: { type: "none" },
    },
    {
      id: "c1", // 중복!
      name: "Component2",
      semanticTag: "div",
      positioning: { type: "static" },
      layout: { type: "none" },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0 },
    { name: "tablet", minWidth: 768 },
    { name: "desktop", minWidth: 1024 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1"],
    },
    tablet: {
      structure: "vertical",
      components: ["c1"],
    },
    desktop: {
      structure: "vertical",
      components: ["c1"],
    },
  },
}
console.log(formatValidationResult(validateSchemaV2(duplicateIds)))

// Test 3: 잘못된 Component Name (not PascalCase)
console.log("\n\n📋 Test 3: Invalid Component Name")
console.log("-".repeat(60))
const invalidName: LaydlerSchemaV2 = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "invalid_component_name", // snake_case는 안됨!
      semanticTag: "div",
      positioning: { type: "static" },
      layout: { type: "none" },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0 },
    { name: "tablet", minWidth: 768 },
    { name: "desktop", minWidth: 1024 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1"],
    },
    tablet: {
      structure: "vertical",
      components: ["c1"],
    },
    desktop: {
      structure: "vertical",
      components: ["c1"],
    },
  },
}
console.log(formatValidationResult(validateSchemaV2(invalidName)))

// Test 4: Layout에서 존재하지 않는 컴포넌트 참조
console.log("\n\n📋 Test 4: Layout References Non-existent Component")
console.log("-".repeat(60))
const invalidReference: LaydlerSchemaV2 = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "Component1",
      semanticTag: "div",
      positioning: { type: "static" },
      layout: { type: "none" },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0 },
    { name: "tablet", minWidth: 768 },
    { name: "desktop", minWidth: 1024 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1", "c999"], // c999는 존재하지 않음!
    },
    tablet: {
      structure: "vertical",
      components: ["c1"],
    },
    desktop: {
      structure: "vertical",
      components: ["c1"],
    },
  },
}
console.log(formatValidationResult(validateSchemaV2(invalidReference)))

// Test 5: Breakpoint 누락
console.log("\n\n📋 Test 5: Missing Required Breakpoint")
console.log("-".repeat(60))
const missingBreakpoint: LaydlerSchemaV2 = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "Component1",
      semanticTag: "div",
      positioning: { type: "static" },
      layout: { type: "none" },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0 },
    // tablet 누락!
    { name: "desktop", minWidth: 1024 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1"],
    },
    tablet: {
      structure: "vertical",
      components: ["c1"],
    },
    desktop: {
      structure: "vertical",
      components: ["c1"],
    },
  },
}
console.log(formatValidationResult(validateSchemaV2(missingBreakpoint)))

// Test 6: Header가 fixed/sticky가 아닌 경우 (warning)
console.log("\n\n📋 Test 6: Header with Static Positioning (Warning)")
console.log("-".repeat(60))
const headerStatic: LaydlerSchemaV2 = {
  schemaVersion: "2.0",
  components: [
    {
      id: "c1",
      name: "GlobalHeader",
      semanticTag: "header",
      positioning: { type: "static" }, // Warning 발생!
      layout: { type: "none" },
    },
  ],
  breakpoints: [
    { name: "mobile", minWidth: 0 },
    { name: "tablet", minWidth: 768 },
    { name: "desktop", minWidth: 1024 },
  ],
  layouts: {
    mobile: {
      structure: "vertical",
      components: ["c1"],
    },
    tablet: {
      structure: "vertical",
      components: ["c1"],
    },
    desktop: {
      structure: "vertical",
      components: ["c1"],
    },
  },
}
console.log(formatValidationResult(validateSchemaV2(headerStatic)))

console.log("\n" + "=".repeat(60))
console.log("✅ Error detection test completed")
