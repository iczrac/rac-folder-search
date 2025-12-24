import * as vscode from 'vscode';
import { SearchConfig } from './types';

/**
 * Manages extension configuration with validation
 */
export class ConfigManager {
  /**
   * Reads and returns the current configuration from VS Code settings
   */
  getConfig(): SearchConfig {
    const config = vscode.workspace.getConfiguration('fold-search');
    
    return {
      followSymlinks: config.get<boolean>('followSymlinks', true),
      maxDepth: config.get<number>('maxDepth', 10),
      includeFiles: config.get<boolean>('includeFiles', true),
      cacheExpiryMinutes: config.get<number>('cacheExpiryMinutes', 10),
      excludePatterns: config.get<string[]>('excludePatterns', [
        'node_modules',
        '.git',
        'dist',
        'build',
        '__pycache__'
      ]),
      maxResults: config.get<number>('maxResults', 10000)
    };
  }

  /**
   * Validates configuration values
   * @param config Configuration to validate
   * @returns true if valid, false otherwise
   */
  validateConfig(config: SearchConfig): boolean {
    // Validate maxDepth
    if (config.maxDepth < 1 || config.maxDepth > 20) {
      vscode.window.showErrorMessage(
        'Folder Search: Invalid maxDepth. Must be between 1 and 20.'
      );
      return false;
    }

    // Validate cacheExpiryMinutes
    if (config.cacheExpiryMinutes < 1) {
      vscode.window.showErrorMessage(
        'Folder Search: Invalid cacheExpiryMinutes. Must be at least 1.'
      );
      return false;
    }

    // Validate maxResults
    if (config.maxResults < 100) {
      vscode.window.showErrorMessage(
        'Folder Search: Invalid maxResults. Must be at least 100.'
      );
      return false;
    }

    // Validate excludePatterns is an array
    if (!Array.isArray(config.excludePatterns)) {
      vscode.window.showErrorMessage(
        'Folder Search: Invalid excludePatterns. Must be an array of strings.'
      );
      return false;
    }

    return true;
  }
}
