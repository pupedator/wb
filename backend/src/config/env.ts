import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Define environment variable schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  
  // Database
  DATABASE_URL: z.string().min(1),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Hashing
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default('12'),
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Optional: Redis
  REDIS_URL: z.string().optional(),
  
  // Optional: Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // Optional: Sentry
  SENTRY_DSN: z.string().url().optional(),
});

// Create a type from the schema
export type EnvVars = z.infer<typeof envSchema>;

/**
 * Validates environment variables against the schema
 * @returns Validated environment variables
 */
export function validateEnv(): EnvVars {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.path.join('.'));
      logger.error(`❌ Missing or invalid environment variables: ${missingVars.join(', ')}`);
      logger.error('Please check your .env file and make sure all required variables are set correctly.');
      process.exit(1);
    }
    
    logger.error('❌ Unknown error validating environment variables:', error);
    process.exit(1);
  }
}

/**
 * Gets validated environment variables
 * @returns Validated environment variables
 */
export function getEnv(): EnvVars {
  return validateEnv();
}

export default {
  validateEnv,
  getEnv,
};
