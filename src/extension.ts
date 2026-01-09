import * as vscode from 'vscode';
import { ConfigManager } from './configManager';
import { CacheManager } from './cacheManager';
import { FolderScanner } from './folderScanner';
import { QuickPickManager } from './quickPickManager';
import { executeSearch } from './searchCommand';
import { PinnedFoldersProvider, PinnedFolderItem } from './pinnedFoldersProvider';

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

  // Register open pinned folder command
  const openPinnedFolderCommand = vscode.commands.registerCommand(
    'folder-search.openPinnedFolder',
    async (fsPath: string) => {
      if (fsPath) {
        const uri = vscode.Uri.file(fsPath);
        await vscode.commands.executeCommand('revealInExplorer', uri);
      }
    }
  );

  // Register unpin folder command
  const unpinCommand = vscode.commands.registerCommand(
    'folder-search.unpinFolder',
    async (item: PinnedFolderItem) => {
      if (item && item.fsPath) {
        pinnedFoldersProvider.unpinFolder(item);
      }
    }
  );

  // Register clear all pinned folders command
  const clearPinnedCommand = vscode.commands.registerCommand(
    'folder-search.clearPinnedFolders',
    async () => {
      const answer = await vscode.window.showWarningMessage(
        'Are you sure you want to unpin all folders?',
        'Yes',
        'No'
      );
      if (answer === 'Yes') {
        pinnedFoldersProvider.unpinAll();
      }
    }
  );

  context.subscriptions.push(
    treeView,
    searchCommand,
    refreshCommand,
    openPinnedFolderCommand,
    unpinCommand,
    clearPinnedCommand
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
