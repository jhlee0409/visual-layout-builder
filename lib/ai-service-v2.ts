/**
 * AI Service V2
 *
 * Schema V2 → AI Prompt → Code Generation
 */

import type { GenerationPackageV2 } from "@/types/schema-v2"
import { generatePromptFromSchemaV2 } from "./prompt-generator-v2"

export interface AIGenerationRequest {
  pkg: GenerationPackageV2
  model?: string
  temperature?: number
}

export interface AIGenerationResponse {
  success: boolean
  code?: string
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * AI 코드 생성 (OpenAI API)
 *
 * @example
 * const response = await generateCodeWithAI({
 *   pkg: generationPackageV2,
 *   model: "gpt-4-turbo-preview"
 * })
 */
export async function generateCodeWithAI(
  request: AIGenerationRequest
): Promise<AIGenerationResponse> {
  const { pkg, model = "gpt-4-turbo-preview", temperature = 0.2 } = request

  // 1. Generate prompt
  const prompt = generatePromptFromSchemaV2(pkg)

  // 2. Call OpenAI API
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert React + Tailwind CSS developer. Generate clean, production-ready code based on the provided specifications.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.error?.message || "API request failed",
      }
    }

    const data = await response.json()
    const generatedCode = data.choices[0]?.message?.content || ""

    return {
      success: true,
      code: generatedCode,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * AI 코드 생성 (Anthropic Claude API)
 *
 * Alternative to OpenAI
 */
export async function generateCodeWithClaude(
  request: AIGenerationRequest
): Promise<AIGenerationResponse> {
  const { pkg, model = "claude-3-5-sonnet-20241022", temperature = 0.2 } = request

  // 1. Generate prompt
  const prompt = generatePromptFromSchemaV2(pkg)

  // 2. Call Anthropic API
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        temperature,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.error?.message || "API request failed",
      }
    }

    const data = await response.json()
    const generatedCode = data.content[0]?.text || ""

    return {
      success: true,
      code: generatedCode,
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Generic AI generation interface
 *
 * Supports multiple providers
 */
export async function generateCode(
  request: AIGenerationRequest,
  provider: "openai" | "claude" = "openai"
): Promise<AIGenerationResponse> {
  switch (provider) {
    case "openai":
      return generateCodeWithAI(request)
    case "claude":
      return generateCodeWithClaude(request)
    default:
      return {
        success: false,
        error: "Unknown provider",
      }
  }
}

/**
 * Parse AI-generated code into files
 *
 * AI가 생성한 코드를 파싱하여 파일 배열로 변환
 */
export function parseGeneratedCode(code: string): {
  path: string
  content: string
}[] {
  const files: { path: string; content: string }[] = []

  // Match code blocks with file paths
  // Example: ```tsx components/Header.tsx
  const fileRegex = /```(?:tsx?|jsx?)\s+([^\n]+)\n([\s\S]*?)```/g
  let match: RegExpExecArray | null

  while ((match = fileRegex.exec(code)) !== null) {
    const filePath = match[1].trim()
    const fileContent = match[2].trim()

    files.push({
      path: filePath,
      content: fileContent,
    })
  }

  return files
}
