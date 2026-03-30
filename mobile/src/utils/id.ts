/**
 * Generates a unique ID without crypto.getRandomValues()
 * Safe to use in React Native where Web Crypto API is unavailable.
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
