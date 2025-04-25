// Environment configuration for ClarirAI frontend

type Environment = 'development' | 'production';

interface Config {
  apiUrl: string;
  environment: Environment;
  isProduction: boolean;
}

// Default to production if not explicitly set to development
const environment: Environment = 
  (process.env.NEXT_PUBLIC_ENVIRONMENT as Environment) || 'production';

const config: Config = {
  // API URL based on environment
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://huggingface.co/spaces/Surajkumaar/ClarirAI',
  
  // Current environment
  environment,
  
  // Helper flag for production checks
  isProduction: environment === 'production',
};

export default config;
