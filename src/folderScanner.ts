import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ScanResult, SearchConfig } from './types';

/**
 * Scans file system and collects folder/file information with symlink support
 */
export class FolderScanner {
  /**
   * Scans all workspace folders and returns results
   * @param workspaceFolders Workspace folders to scan
   * @param config Search configuration
   * @returns Array of scan results
   */
  async scan(
    workspaceFolders: readonly vscode.WorkspaceFolder[],
    config: SearchConfig
  ): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    
    // Scan each workspace folder independently
    for (const folder of workspaceFolders) {
      const visited = new Set<string>();
      const workspaceName = workspaceFolders.length > 1 ? folder.name : '';
      
      await this.scanDirectory(
        folder.uri.fsPath,
        workspaceName,
        results,
        visited,
        config,
        0
      );
    }
    
    return results;
  }

  /**
   * Recursively scans a directory
   * @param dirPath Absolute path to directory
   * @param relativePath Relative path from workspace root
   * @param results Array to collect results
   * @param visited Set of visited real paths (for circular reference detection)
   * @param config Search configuration
   * @param currentDepth Current recursion depth
   */
  private async scanDirectory(
    dirPath: string,
    relativePath: string,
    results: ScanResult[],
    visited: Set<string>,
    config: SearchConfig,
    currentDepth: number
  ): Promise<void> {
    // Check depth limit - don't scan this directory if we're at max depth
    if (currentDepth >= config.maxDepth) {
      return;
    }

    // Check result limit
    if (results.length >= config.maxResults) {
      return;
    }

    // Resolve real path for circular reference detection
    let realPath: string;
    try {
      realPath = fs.realpathSync(dirPath);
    } catch (error) {
      // Skip if cannot resolve real path
      console.warn(`Cannot resolve real path for ${dirPath}:`, error);
      return;
    }

    // Check for circular reference
    if (visited.has(realPath)) {
      return;
    }
    visited.add(realPath);

    // Read directory entries
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    } catch (error) {
      // Skip if cannot read directory (permission error, etc.)
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EACCES') {
        console.warn(`Permission denied: ${dirPath}`);
      } else if (err.code === 'ENOENT') {
        console.warn(`Directory not found: ${dirPath}`);
      } else {
        console.error(`Error reading directory ${dirPath}:`, error);
      }
      return;
    }

    // Process each entry
    for (const entry of entries) {
      // Check result limit
      if (results.length >= config.maxResults) {
        return;
      }

      // Skip hidden files/directories
      if (entry.name.startsWith('.')) {
        continue;
      }

      // Skip excluded patterns
      if (config.excludePatterns.includes(entry.name)) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const newRelativePath = relativePath 
        ? path.join(relativePath, entry.name)
        : entry.name;

      // Determine if entry is a directory and if it's a symlink
      let isDirectory = entry.isDirectory();
      const isSymlink = entry.isSymbolicLink();

      // Follow symlinks if configured
      if (isSymlink && config.followSymlinks) {
        try {
          const stats = await fs.promises.stat(fullPath); // Follows symlink
          isDirectory = stats.isDirectory();
        } catch (error) {
          // Skip broken symlinks
          const err = error as NodeJS.ErrnoException;
          if (err.code === 'ENOENT') {
            console.warn(`Broken symlink: ${fullPath}`);
          } else {
            console.warn(`Error following symlink ${fullPath}:`, error);
          }
          continue;
        }
      }

      // Process directories
      if (isDirectory) {
        const label = `$(folder) ${entry.name}${isSymlink ? ' 🔗' : ''}`;
        
        results.push({
          label,
          description: relativePath || '/',
          fsPath: fullPath,
          isFolder: true,
          isSymlink
        });

        // Recursively scan subdirectory
        await this.scanDirectory(
          fullPath,
          newRelativePath,
          results,
          visited,
          config,
          currentDepth + 1
        );
      }
      // Process files (if enabled)
      else if (config.includeFiles) {
        const label = `$(file) ${entry.name}`;
        
        results.push({
          label,
          description: relativePath || '/',
          fsPath: fullPath,
          isFolder: false,
          isSymlink
        });
      }
    }
  }
}
