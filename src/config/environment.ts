import 'dotenv/config';
import { z } from 'zod';

export function validateEnv(env: Record<string, any>) {
  const schema = z.object({
    port: z.string().default('3000'),
    databaseUrl: z.string().url(),
    redisUrl: z.string().optional(),
    paymentApiKey: z.string().optional()
  });

  return schema.parse({
    port: env.PORT,
    databaseUrl: env.DATABASE_URL, // Reads DATABASE_URL from .env
    redisUrl: env.REDIS_URL,
    paymentApiKey: env.PAYMENT_API_KEY
  });
}
