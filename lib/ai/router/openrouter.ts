import { z } from 'zod';
import { getRouterConfig } from './config';

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
}

export interface OpenRouterCompletionResult {
  id: string;
  content: string;
}

export class OpenRouterClient {
  private config = getRouterConfig();
  
  async createCompletion(options: OpenRouterCompletionOptions): Promise<OpenRouterCompletionResult> {
    if (!this.config.openrouter.apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch(`${this.config.openrouter.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openrouter.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://quntedge.com',
        'X-Title': 'Qunt Edge',
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const parsed = OpenRouterResponseSchema.parse(data);
    
    return {
      id: parsed.id,
      content: parsed.choices[0].message.content,
    };
  }
}
