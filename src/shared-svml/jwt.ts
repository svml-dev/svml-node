import { jwtDecode } from 'jwt-decode';

/**
 * Decodes a JWT, removing www_ or svml_ prefix if present.
 * @param token The JWT string (may be prefixed)
 * @returns The decoded payload as an object
 */
export function decodeJwt(token: string): any {
  if (token.startsWith('www_') || token.startsWith('svml_')) {
    token = token.split('_', 2)[1]; // Only remove the first prefix
  }
  return jwtDecode(token);
}

/**
 * Extracts a specific claim from a JWT.
 * @param token The JWT string
 * @param claim The claim name
 * @returns The claim value, or undefined if not present
 */
export function getJwtClaim(token: string, claim: string): any {
  return decodeJwt(token)[claim];
}

/**
 * Gets all standard claims from a JWT as a typed object.
 * @param token The JWT string
 * @returns An object with standard claims (sub, role, exp, etc.)
 */
export interface JwtClaims {
  sub?: string;
  role?: string;
  exp?: number | string;
  iat?: number | string;
  aud?: string;
  iss?: string;
  [key: string]: any;
}
export function getAllJwtClaims(token: string): JwtClaims {
  return decodeJwt(token) as JwtClaims;
}

/**
 * Checks if a JWT is expired.
 * @param token The JWT string
 * @returns True if expired, false otherwise
 */
export function isJwtExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload.exp) return false;
  const exp = typeof payload.exp === 'string' ? parseInt(payload.exp, 10) : payload.exp;
  return Date.now() / 1000 > exp;
} 