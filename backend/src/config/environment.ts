import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().default(''),
  PORT: z.string().default('3000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().default('dev-secret-key-change-in-production-32chars!!'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:8081')
    .transform((val) => val.split(',')),
  MOCK_MODE: z.string().default('').transform((v) => v === 'true' || v === '1'),
  // ElevenLabs TTS — optional, voice mode is disabled when absent
  ELEVENLABS_API_KEY: z.string().default(''),
  ELEVENLABS_VOICE_ID: z.string().default('pNInz6obpgDQGcFmaJgB'), // Adam — deep, resonant
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
