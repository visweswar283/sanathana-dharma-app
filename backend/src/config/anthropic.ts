import Anthropic from '@anthropic-ai/sdk';
import { env } from './environment';

export const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

export const CLAUDE_MODEL = 'claude-sonnet-4-6';
