import { z } from 'zod';
import { getRouterConfig } from './config';
import { sanitizeAiError } from '@/lib/ai/error-utils';

const OpenRouterResponseSchema = z.object({
  id: z.string(),
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string(),
      }),
    })
  ),
});

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterCompletionOptions {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  provider?: {
    order?: string[];
    sort?: 'price';
    max_price?: {
      input?: number;
      output?: number;
    };
  };
}

export interface OpenRouterCompletionResult {
  id: string;
  content: string;
}

export class OpenRouterClient {
  async createCompletion(options: OpenRouterCompletionOptions): Promise<OpenRouterCompletionResult> {
    const config = getRouterConfig();
    if (!config.openrouter.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch(`${config.openrouter.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openrouter.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://quntedge.com',
        'X-Title': 'Qunt Edge',
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        provider: options.provider,
      }),
    });

    if (!response.ok) {
      // Never include raw provider response bodies in thrown errors to avoid leaking prompt data.
      let message = `OpenRouter API error: ${response.status} ${response.statusText}`;
      try {
        const parsedError = (await response.json()) as {
          error?: { message?: string; code?: string | number };
        };
        const providerMessage = parsedError?.error?.message?.trim();
        const providerCode = parsedError?.error?.code != null ? String(parsedError.error.code) : null;
        if (providerCode) {
          message += ` [code=${providerCode}]`;
        }
        if (providerMessage) {
          message += ` ${providerMessage.slice(0, 160)}`;
        }
      } catch {
        // Ignore parse failures and keep generic error string.
      }
      throw new Error(message);
    }

    const data = await response.json();
    let parsed: z.infer<typeof OpenRouterResponseSchema>;
    try {
      parsed = OpenRouterResponseSchema.parse(data);
    } catch (error) {
      const details = sanitizeAiError(error);
      throw new Error(`OpenRouter response schema validation failed: ${details.message}`);
    }

    if (!parsed.choices.length) {
      throw new Error('OpenRouter response missing completion choices');
    }
    
    return {
      id: parsed.id,
      content: parsed.choices[0].message.content,
    };
  }
}
