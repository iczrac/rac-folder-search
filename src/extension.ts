import * as vscode from 'vscode';
import { ConfigManager } from './configManager';
import { CacheManager } from './cacheManager';
import { FolderScanner } from './folderScanner';
import { QuickPickManager } from './quickPickManager';
import { executeSearch } from './searchCommand';
import { PinnedFoldersProvider } from './pinnedFoldersProvider';

// Global instances
let configManager: ConfigManager;
let cacheManager: CacheManager;
let scanner: FolderScanner;
let quickPickManager: QuickPickManager;
let pinnedFoldersProvider: PinnedFoldersProvider;

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('RAC Folder Search is now active');

  // Initialize components
  configManager = new ConfigManager();
  cacheManager = new CacheManager();
  scanner = new FolderScanner();
  quickPickManager = new QuickPickManager();
  pinnedFoldersProvider = new PinnedFoldersProvider(context);

  // Register TreeView for pinned folders
  const treeView = vscode.window.createTreeView('racFolderSearch.pinnedFolders', {
    treeDataProvider: pinnedFoldersProvider,
    showCollapseAll: false
  });

  // Register search command
  const searchCommand = vscode.commands.registerCommand(
    'folder-search.search',
    async () => {
      await executeSearch(
        configManager,
        cacheManager,
        scanner,
        quickPickManager,
        pinnedFoldersProvider
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

  // Register pin folder command
  const pinCommand = vscode.commands.registerCommand(
    'folder-search.pinFolder',
    async (fsPath?: string, isSymlink?: boolean) => {
      if (fsPath) {
        await pinnedFoldersProvider.pinFolder(fsPath, isSymlink);
      }
    }
  );

  // Register unpin folder command
  const unpinCommand = vscode.commands.registerCommand(
    'folder-search.unpinFolder',
    async (item: any) => {
      if (item && item.folder) {
        await pinnedFoldersProvider.unpinFolder(item.folder.fsPath);
      }
    }
  );

  // Register clear all pinned folders command
  const clearPinnedCommand = vscode.commands.registerCommand(
    'folder-search.clearPinnedFolders',
    async () => {
      await pinnedFoldersProvider.clearAll();
    }
  );

  // Register open folder command
  const openFolderCommand = vscode.commands.registerCommand(
    'folder-search.openFolder',
    async (item: any) => {
      if (item && item.folder) {
        const uri = vscode.Uri.file(item.folder.fsPath);
        await vscode.commands.executeCommand('revealInExplorer', uri);
      }
    }
  );

  context.subscriptions.push(
    treeView,
    searchCommand,
    refreshCommand,
    pinCommand,
    unpinCommand,
    clearPinnedCommand,
    openFolderCommand
  );
}

/**
 * Get pinned folders provider (for testing)
 */
export function getPinnedFoldersProvider(): PinnedFoldersProvider | undefined {
  return pinnedFoldersProvider;
}

/**
 * Extension deactivation
 */
export function deactivate() {
  // Cleanup if needed
}
