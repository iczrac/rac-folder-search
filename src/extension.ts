import * as vscode from 'vscode';
import { ConfigManager } from './configManager';
import { CacheManager } from './cacheManager';
import { FolderScanner } from './folderScanner';
import { QuickPickManager } from './quickPickManager';
import { executeSearch } from './searchCommand';
import { PinnedItemsProvider, PinnedItem } from './pinnedItemsProvider';

// Global instances
let configManager: ConfigManager;
let cacheManager: CacheManager;
let scanner: FolderScanner;
let quickPickManager: QuickPickManager;
let pinnedItemsProvider: PinnedItemsProvider;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
  console.log('RAC Folder Search is now active');

  // Initialize components
  configManager = new ConfigManager();
  cacheManager = new CacheManager();
  scanner = new FolderScanner();
  quickPickManager = new QuickPickManager();
  pinnedItemsProvider = new PinnedItemsProvider(context);

  // Register TreeView for pinned items
  const treeView = vscode.window.createTreeView('racFolderSearch.pinnedFolders', {
    treeDataProvider: pinnedItemsProvider,
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
        pinnedItemsProvider
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
        await pinnedItemsProvider.openPinnedItem(fsPath);
      }
    }
  );

  // Register open pinned file command
  const openPinnedFileCommand = vscode.commands.registerCommand(
    'folder-search.openPinnedFile',
    async (fsPath: string) => {
      if (fsPath) {
        await pinnedItemsProvider.openPinnedItem(fsPath);
      }
    }
  );

  // Register unpin item command
  const unpinCommand = vscode.commands.registerCommand(
    'folder-search.unpinFolder',
    async (item: PinnedItem) => {
      if (item && item.fsPath) {
        pinnedItemsProvider.unpinItem(item);
      }
    }
  );

  // Register clear all pinned items command
  const clearPinnedCommand = vscode.commands.registerCommand(
    'folder-search.clearPinnedFolders',
    async () => {
      const answer = await vscode.window.showWarningMessage(
        'Are you sure you want to unpin all items?',
        'Yes',
        'No'
      );
      if (answer === 'Yes') {
        pinnedItemsProvider.unpinAll();
      }
    }
  );

  // Register cleanup non-existent items command
  const cleanupPinnedCommand = vscode.commands.registerCommand(
    'folder-search.cleanupPinnedItems',
    async () => {
      const remainingCount = await pinnedItemsProvider.forceCleanup();
      vscode.window.showInformationMessage(
        `Cleanup completed. ${remainingCount} items remain in the pinned list.`
      );
    }
  );

  // Register pin item from explorer command
  const pinFromExplorerCommand = vscode.commands.registerCommand(
    'folder-search.pinFromExplorer',
    async (uri: vscode.Uri) => {
      console.log('pinFromExplorer called with uri:', uri?.fsPath);
      if (uri && uri.fsPath) {
        const itemName = uri.fsPath.split('/').pop() || uri.fsPath;
        
        if (pinnedItemsProvider.isPinned(uri.fsPath)) {
          console.log('Unpinning:', itemName);
          // Unpin
          const pinnedItems = await pinnedItemsProvider.getChildren();
          const pinnedItem = pinnedItems.find(i => i.fsPath === uri.fsPath);
          if (pinnedItem) {
            pinnedItemsProvider.unpinItem(pinnedItem);
          }
        } else {
          console.log('Pinning:', itemName);
          // Pin (auto-detect type and symlink status) with error handling
          try {
            await pinnedItemsProvider.pinItem(
              uri.fsPath,
              itemName,
              uri.fsPath
            );
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(
              `Failed to pin "${itemName}": ${errorMessage}`
            );
          }
        }
      }
    }
  );

  // Register pin file command (handles both pin and unpin)
  const pinFileCommand = vscode.commands.registerCommand(
    'folder-search.pinFile',
    async (uri: vscode.Uri) => {
      console.log('pinFile called with uri:', uri?.fsPath);
      if (uri && uri.fsPath) {
        const itemName = uri.fsPath.split('/').pop() || uri.fsPath;
        
        if (pinnedItemsProvider.isPinned(uri.fsPath)) {
          console.log('Unpinning file:', itemName);
          // Unpin
          const pinnedItems = await pinnedItemsProvider.getChildren();
          const pinnedItem = pinnedItems.find(i => i.fsPath === uri.fsPath);
          if (pinnedItem) {
            pinnedItemsProvider.unpinItem(pinnedItem);
          }
        } else {
          console.log('Pinning file:', itemName);
          // Validate file exists before pinning
          const validation = await pinnedItemsProvider.validatePinnedItem(uri.fsPath);
          if (!validation.exists) {
            vscode.window.showErrorMessage(`Cannot pin file: ${validation.error}`);
            return;
          }
          
          if (!validation.accessible) {
            vscode.window.showWarningMessage(
              `File "${itemName}" exists but may not be accessible: ${validation.error}. Pinning anyway.`
            );
          }
          
          try {
            // Pin as file (auto-detect symlink status)
            const isSymlink = await pinnedItemsProvider.detectSymlink(uri);
            pinnedItemsProvider.pinFile(uri.fsPath, itemName, uri.fsPath, isSymlink);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(
              `Failed to pin file "${itemName}": ${errorMessage}`
            );
          }
        }
      }
    }
  );

  // Register unpin file command (kept for backward compatibility)
  const unpinFileCommand = vscode.commands.registerCommand(
    'folder-search.unpinFile',
    async (uri: vscode.Uri) => {
      console.log('unpinFile called with uri:', uri?.fsPath);
      if (uri && uri.fsPath) {
        const pinnedItems = await pinnedItemsProvider.getChildren();
        const pinnedItem = pinnedItems.find(i => i.fsPath === uri.fsPath);
        if (pinnedItem) {
          pinnedItemsProvider.unpinItem(pinnedItem);
        }
      }
    }
  );

  // Register pin folder command (handles both pin and unpin)
  const pinFolderCommand = vscode.commands.registerCommand(
    'folder-search.pinFolder',
    async (uri: vscode.Uri) => {
      console.log('pinFolder called with uri:', uri?.fsPath);
      if (uri && uri.fsPath) {
        const itemName = uri.fsPath.split('/').pop() || uri.fsPath;
        
        if (pinnedItemsProvider.isPinned(uri.fsPath)) {
          console.log('Unpinning folder:', itemName);
          // Unpin
          const pinnedItems = await pinnedItemsProvider.getChildren();
          const pinnedItem = pinnedItems.find(i => i.fsPath === uri.fsPath);
          if (pinnedItem) {
            pinnedItemsProvider.unpinItem(pinnedItem);
          }
        } else {
          console.log('Pinning folder:', itemName);
          // Validate folder exists before pinning
          const validation = await pinnedItemsProvider.validatePinnedItem(uri.fsPath);
          if (!validation.exists) {
            vscode.window.showErrorMessage(`Cannot pin folder: ${validation.error}`);
            return;
          }
          
          if (!validation.accessible) {
            vscode.window.showWarningMessage(
              `Folder "${itemName}" exists but may not be accessible: ${validation.error}. Pinning anyway.`
            );
          }
          
          try {
            // Pin as folder (auto-detect symlink status)
            const isSymlink = await pinnedItemsProvider.detectSymlink(uri);
            pinnedItemsProvider.pinFolder(uri.fsPath, itemName, uri.fsPath, isSymlink);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(
              `Failed to pin folder "${itemName}": ${errorMessage}`
            );
          }
        }
      }
    }
  );

  // Register unpin folder command (different from the existing one for tree view)
  const unpinFolderFromExplorerCommand = vscode.commands.registerCommand(
    'folder-search.unpinFolderFromExplorer',
    async (uri: vscode.Uri) => {
      console.log('unpinFolderFromExplorer called with uri:', uri?.fsPath);
      if (uri && uri.fsPath) {
        const pinnedItems = await pinnedItemsProvider.getChildren();
        const pinnedItem = pinnedItems.find(i => i.fsPath === uri.fsPath);
        if (pinnedItem) {
          pinnedItemsProvider.unpinItem(pinnedItem);
        }
      }
    }
  );

  // Context variable management system (simplified)
  // Initialize context variables to safe defaults
  await vscode.commands.executeCommand('setContext', 'racFolderSearch.isFilePinned', false);
  await vscode.commands.executeCommand('setContext', 'racFolderSearch.isFolderPinned', false);

  // Listen to file system changes to clean up pinned items when files are deleted
  const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*');
  
  fileSystemWatcher.onDidDelete(async (uri) => {
    // Remove from pinned items if the file/folder was deleted
    const pinnedItems = await pinnedItemsProvider.getChildren();
    const pinnedItem = pinnedItems.find(i => i.fsPath === uri.fsPath);
    if (pinnedItem) {
      console.log('Auto-removing deleted item from pinned list:', uri.fsPath);
      pinnedItemsProvider.unpinItem(pinnedItem);
      
      // Show user-friendly notification
      const itemType = pinnedItem.type === 'file' ? 'file' : 'folder';
      vscode.window.showInformationMessage(
        `Removed deleted ${itemType} "${pinnedItem.label}" from pinned list`
      );
    }
  });

  context.subscriptions.push(
    treeView,
    searchCommand,
    refreshCommand,
    openPinnedFolderCommand,
    openPinnedFileCommand,
    unpinCommand,
    clearPinnedCommand,
    cleanupPinnedCommand,
    pinFromExplorerCommand,
    pinFileCommand,
    unpinFileCommand,
    pinFolderCommand,
    unpinFolderFromExplorerCommand,
    fileSystemWatcher
  );
}

/**
 * Get pinned items provider (for testing)
 */
export function getPinnedItemsProvider(): PinnedItemsProvider | undefined {
  return pinnedItemsProvider;
}

/**
 * Extension deactivation
 */
export function deactivate() {
  // Cleanup if needed
}
