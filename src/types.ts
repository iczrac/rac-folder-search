/**
 * Core type definitions for the folder search extension
 */

/**
 * Represents a single file or folder in the search results
 */
export interface ScanResult {
  /** Display label with VS Code icon (e.g., "$(folder) name 🔗") */
  label: string;
  
  /** Relative path from workspace root, used as description in QuickPick */
  description: string;
  
  /** Absolute file system path */
  fsPath: string;
  
  /** True if this is a directory */
  isFolder: boolean;
  
  /** True if this is a symbolic link */
  isSymlink: boolean;
}

/**
 * User configuration for search behavior
 */
export interface SearchConfig {
  /** Whether to follow symbolic links */
  followSymlinks: boolean;
  
  /** Maximum directory depth to scan */
  maxDepth: number;
  
  /** Whether to include files in results */
  includeFiles: boolean;
  
  /** Cache expiration time in minutes */
  cacheExpiryMinutes: number;
  
  /** Directory names to exclude from scanning */
  excludePatterns: string[];
  
  /** Maximum number of results to collect */
  maxResults: number;
}

/**
 * Internal cache storage structure
 */
export interface CacheEntry {
  /** Cached scan results */
  results: ScanResult[];
  
  /** Timestamp when cache was created (milliseconds since epoch) */
  timestamp: number;
}
