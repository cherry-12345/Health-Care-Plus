/**
 * Environment Variable Validation
 * Validates required environment variables at application startup
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

const optionalEnvVars = [
  'NEXT_PUBLIC_APP_URL',
  'NODE_ENV',
] as const;

export function validateEnv() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check optional variables
  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  // Report missing required variables
  if (missing.length > 0) {
    const errorMessage = `
╔═══════════════════════════════════════════════════════════════╗
║  ❌ MISSING REQUIRED ENVIRONMENT VARIABLES                    ║
╚═══════════════════════════════════════════════════════════════╝

The following required environment variables are not set:
${missing.map(v => `  • ${v}`).join('\n')}

Please create a .env.local file in the project root with these variables.

Example .env.local:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
    `;
    
    throw new Error(errorMessage);
  }

  // Report warnings for optional variables
  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  Optional environment variables not set:', warnings.join(', '));
  }

  // Validate MongoDB URI format
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
    throw new Error('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  }

  console.log('✅ Environment variables validated successfully');
}

// Auto-validate on import (server-side only)
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    console.error(error);
    // In development, we might want to continue anyway for demo data
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}
