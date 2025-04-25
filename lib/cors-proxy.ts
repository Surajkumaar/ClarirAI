/**
 * CORS Proxy for ClarirAI
 * 
 * This utility helps bypass CORS restrictions when connecting to the Hugging Face Spaces backend
 */

// The actual backend URL - using the correct Hugging Face Spaces format
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://surajkumaar-clarirai.hf.space';

/**
 * Creates a proxied URL to bypass CORS restrictions
 * Uses the server-side API proxy to handle all requests
 */
export function getProxiedUrl(path: string): string {
  // Ensure path has a leading slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Always use the server-side proxy
  return `/api/proxy${cleanPath}`;
}

export default getProxiedUrl;
