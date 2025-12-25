import { z } from 'zod';

const envSchema = z.object({
  ORACLE_USER: z.string().optional(),
  ORACLE_PASSWORD: z.string().optional(),
  ORACLE_CONN_STRING: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  // Don't crash, just warn
}

export const env = _env.success ? _env.data : {};