import * as vscode from 'vscode';
import { ConfigManager } from './configManager';
import { CacheManager } from './cacheManager';
import { FolderScanner } from './folderScanner';
import { QuickPickManager } from './quickPickManager';
import { executeSearch } from './searchCommand';

// Global instances
let configManager: ConfigManager;
let cacheManager: CacheManager;
let scanner: FolderScanner;
let quickPickManager: QuickPickManager;

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Folder Search with Symlink Support is now active');

  // Initialize components
  configManager = new ConfigManager();
  cacheManager = new CacheManager();
  scanner = new FolderScanner();
  quickPickManager = new QuickPickManager();

  // Register search command
  const searchCommand = vscode.commands.registerCommand(
    'folder-search.search',
    async () => {
      await executeSearch(
        configManager,
        cacheManager,
        scanner,
        quickPickManager
      );
    }
  );

  // Register refresh cache command
  const refreshCommand = vscode.commands.registerCommand(
    'folder-search.refreshCache',
    () => {
      cacheManager.clear();
      vscode.window.showInformationMessage(
        'Folder Search: Cache cleared. Next search will rebuild the index.'
      );
    }
  );

  context.subscriptions.push(searchCommand, refreshCommand);
}

/**
 * Extension deactivation
 */
export function deactivate() {
  // Cleanup if needed
}
