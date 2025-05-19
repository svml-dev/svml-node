import { findUpSync } from 'find-up';
import * as fs from 'fs';
import * as path from 'path';

// Module-level cache to avoid repeated lookups
let packageInfoCache: any = null;
let hasLoggedWarning = false;

/**
 * Dynamically finds and loads the package.json file regardless of where the code is run from
 * (works both with local development and when published to npm)
 */
export function getPackageInfo() {
  // Return cached result if available
  if (packageInfoCache) {
    return packageInfoCache;
  }

  // Try multiple possible locations
  const possiblePaths = [
    path.join(__dirname, '../package.json'),
    path.join(__dirname, '../../package.json'),
    path.join(__dirname, '../../../package.json'),
    path.join(process.cwd(), 'package.json')
  ];

  // For debugging
  const debugInfo = {
    __dirname,
    cwd: process.cwd(),
    filesExist: {} as Record<string, boolean>,
    errors: {} as Record<string, string>
  };

  for (const pkgPath of possiblePaths) {
    try {
      const exists = fs.existsSync(pkgPath);
      debugInfo.filesExist[pkgPath] = exists;
      
      if (exists) {
        try {
          // Use readFileSync instead of require to avoid Next.js bundling issues
          const content = fs.readFileSync(pkgPath, 'utf8');
          packageInfoCache = JSON.parse(content);
          // console.log(`[svml-client package-info.ts] Successfully loaded package.json from: ${pkgPath}`);
          return packageInfoCache;
        } catch (readError: any) {
          debugInfo.errors[pkgPath] = `Read/parse error: ${readError.message}`;
        }
      }
    } catch (e: any) {
      debugInfo.errors[pkgPath] = `Exists check error: ${e.message}`;
    }
  }

  // Fallback if no package.json found
  if (!hasLoggedWarning) {
    console.warn('[svml-client package-info.ts] Could not find or load package.json:', debugInfo);
    hasLoggedWarning = true;
  }
  
  packageInfoCache = { version: 'unknown', name: 'svml' };
  return packageInfoCache;
}

/**
 * Shorthand to get just the package version
 */
export function getPackageVersion(): string {
  return getPackageInfo().version;
} 