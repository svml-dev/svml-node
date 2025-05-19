import { findUpSync } from 'find-up';
import * as fs from 'fs';
import * as path from 'path';
/**
 * Dynamically finds and loads the package.json file regardless of where the code is run from
 * (works both with local development and when published to npm)
 */
export function getPackageInfo() {
  // Try multiple possible locations
  const possiblePaths = [
    path.join(__dirname, '../package.json'),
    path.join(__dirname, '../../package.json'),
    path.join(__dirname, '../../../package.json'),
    path.join(process.cwd(), 'package.json')
  ];

  for (const pkgPath of possiblePaths) {
    try {
      if (fs.existsSync(pkgPath)) {
        return require(pkgPath);
      }
    } catch (e) {
      // Continue to next path
    }
  }

  // Fallback if no package.json found
  console.warn('Could not find package.json, using default values');
  return { version: 'unknown', name: 'svml' };
}

/**
 * Shorthand to get just the package version
 */
export function getPackageVersion(): string {
  return getPackageInfo().version;
} 