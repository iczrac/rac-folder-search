import * as vscode from 'vscode';
import { PinnedItemData, PinnedItemType } from './types';

/**
 * Represents a pinned item (file or folder) in the tree view
 */
export class PinnedItem extends vscode.TreeItem {
  constructor(
    public readonly fsPath: string,
    public readonly label: string,
    public readonly description: string,
    public readonly isSymlink: boolean,
    public readonly type: PinnedItemType
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    
    this.tooltip = fsPath;
    this.description = description;
    this.contextValue = type === PinnedItemType.file ? 'pinnedFile' : 'pinnedFolder';
    
    // Set icon based on type
    if (type === PinnedItemType.file) {
      this.iconPath = vscode.ThemeIcon.File;
    } else {
      this.iconPath = vscode.ThemeIcon.Folder;
    }
    
    // Add symlink indicator
    if (isSymlink) {
      this.label = `${label} 🔗`;
    }
    
    // Set command based on type
    if (type === PinnedItemType.file) {
      this.command = {
        command: 'folder-search.openPinnedFile',
        title: 'Open File',
        arguments: [this.fsPath]
      };
    } else {
      this.command = {
        command: 'folder-search.openPinnedFolder',
        title: 'Open Folder',
        arguments: [this.fsPath]
      };
    }
  }
}

/**
 * Tree data provider for pinned items (files and folders)
 */
export class PinnedItemsProvider implements vscode.TreeDataProvider<PinnedItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<PinnedItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  
  private pinnedItems: Map<string, PinnedItem> = new Map();
  private context: vscode.ExtensionContext;
  
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.loadPinnedItems();
  }
  
  /**
   * Get tree item
   */
  getTreeItem(element: PinnedItem): vscode.TreeItem {
    return element;
  }
  
  /**
   * Get children (root level items)
   */
  getChildren(element?: PinnedItem): Thenable<PinnedItem[]> {
    if (element) {
      return Promise.resolve([]);
    }
    
    // Return all pinned items sorted by type (folders first) then by label
    const items = Array.from(this.pinnedItems.values());
    items.sort((a, b) => {
      // Folders first, then files
      if (a.type !== b.type) {
        return a.type === PinnedItemType.folder ? -1 : 1;
      }
      // Within same type, sort alphabetically
      return a.label.localeCompare(b.label);
    });
    return Promise.resolve(items);
  }

  /**
   * Pin a file
   */
  pinFile(fsPath: string, label: string, description: string, isSymlink: boolean): void {
    const cleanLabel = label.replace(/^📌\s*/, '').replace(/\s*🔗$/, '');
    
    if (this.pinnedItems.has(fsPath)) {
      vscode.window.showInformationMessage(`File "${cleanLabel}" is already pinned`);
      return;
    }
    
    const item = new PinnedItem(fsPath, cleanLabel, description, isSymlink, PinnedItemType.file);
    this.pinnedItems.set(fsPath, item);
    this.savePinnedItems();
    this.refresh();
    
    vscode.window.showInformationMessage(`📌 Pinned file: ${cleanLabel}`);
  }
  
  /**
   * Pin a folder
   */
  pinFolder(fsPath: string, label: string, description: string, isSymlink: boolean): void {
    const cleanLabel = label.replace(/^📌\s*/, '').replace(/\s*🔗$/, '');
    
    if (this.pinnedItems.has(fsPath)) {
      vscode.window.showInformationMessage(`Folder "${cleanLabel}" is already pinned`);
      return;
    }
    
    const item = new PinnedItem(fsPath, cleanLabel, description, isSymlink, PinnedItemType.folder);
    this.pinnedItems.set(fsPath, item);
    this.savePinnedItems();
    this.refresh();
    
    vscode.window.showInformationMessage(`📌 Pinned folder: ${cleanLabel}`);
  }

  /**
   * Unpin an item
   */
  unpinItem(item: PinnedItem): void {
    const cleanLabel = item.label.replace(/^📌\s*/, '').replace(/\s*🔗$/, '');
    
    if (this.pinnedItems.delete(item.fsPath)) {
      this.savePinnedItems();
      this.refresh();
      const itemType = item.type === PinnedItemType.file ? 'file' : 'folder';
      vscode.window.showInformationMessage(`📍 Unpinned ${itemType}: ${cleanLabel}`);
    }
  }
  
  /**
   * Unpin all items
   */
  unpinAll(): void {
    this.pinnedItems.clear();
    this.savePinnedItems();
    this.refresh();
    vscode.window.showInformationMessage('All items unpinned');
  }
  
  /**
   * Check if an item is pinned
   */
  isPinned(fsPath: string): boolean {
    return this.pinnedItems.has(fsPath);
  }
  
  /**
   * Get the type of a pinned item
   */
  getItemType(fsPath: string): PinnedItemType | undefined {
    const item = this.pinnedItems.get(fsPath);
    return item?.type;
  }
  
  /**
   * Get count of pinned items
   */
  getCount(): number {
    return this.pinnedItems.size;
  }

  /**
   * Pin an item (auto-detect type and symlink status)
   */
  async pinItem(fsPath: string, label: string, description: string, isSymlink?: boolean): Promise<void> {
    const fs = await import('fs');
    
    try {
      const stats = await fs.promises.lstat(fsPath);
      const detectedSymlink = isSymlink !== undefined ? isSymlink : stats.isSymbolicLink();
      
      if (stats.isFile() || (stats.isSymbolicLink() && !stats.isDirectory())) {
        this.pinFile(fsPath, label, description, detectedSymlink);
      } else if (stats.isDirectory() || (stats.isSymbolicLink() && stats.isDirectory())) {
        this.pinFolder(fsPath, label, description, detectedSymlink);
      } else {
        throw new Error('Path is neither a file nor a directory');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Cannot pin item: ${errorMessage}`);
    }
  }

  /**
   * Open a pinned item (file or folder)
   */
  async openPinnedItem(fsPath: string): Promise<void> {
    const item = this.pinnedItems.get(fsPath);
    if (!item) {
      vscode.window.showErrorMessage('Pinned item not found');
      return;
    }

    try {
      if (item.type === PinnedItemType.file) {
        const document = await vscode.workspace.openTextDocument(fsPath);
        await vscode.window.showTextDocument(document);
      } else {
        const uri = vscode.Uri.file(fsPath);
        await vscode.commands.executeCommand('revealInExplorer', uri);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`Cannot open pinned item: ${errorMessage}`);
    }
  }

  /**
   * Validate if a pinned item exists and is accessible
   */
  async validatePinnedItem(fsPath: string): Promise<{ exists: boolean; accessible: boolean; error?: string }> {
    const fs = await import('fs');
    
    try {
      await fs.promises.access(fsPath);
      return { exists: true, accessible: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { exists: false, accessible: false, error: errorMessage };
    }
  }

  /**
   * Detect if a path is a symlink
   */
  async detectSymlink(uri: vscode.Uri): Promise<boolean> {
    const fs = await import('fs');
    
    try {
      const stats = await fs.promises.lstat(uri.fsPath);
      return stats.isSymbolicLink();
    } catch (error) {
      return false;
    }
  }

  /**
   * Force cleanup of invalid pinned items
   */
  async forceCleanup(): Promise<number> {
    const fs = await import('fs');
    const itemsToRemove: string[] = [];
    
    for (const [fsPath] of this.pinnedItems) {
      try {
        await fs.promises.access(fsPath);
      } catch (error) {
        itemsToRemove.push(fsPath);
      }
    }
    
    for (const fsPath of itemsToRemove) {
      this.pinnedItems.delete(fsPath);
    }
    
    if (itemsToRemove.length > 0) {
      this.savePinnedItems();
      this.refresh();
    }
    
    return this.pinnedItems.size;
  }

  /**
   * Get migration status (for backward compatibility)
   */
  getMigrationStatus(): { completed: boolean; version: number; hasOldData: boolean } {
    const migrationVersion = this.context.workspaceState.get<number>('migrationVersion', 0);
    const oldData = this.context.workspaceState.get<unknown[]>('pinnedFolders', []);
    
    return { 
      completed: migrationVersion >= 1, 
      version: migrationVersion,
      hasOldData: oldData.length > 0
    };
  }

  /**
   * Refresh tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Save pinned items to workspace state
   */
  private savePinnedItems(): void {
    const data: PinnedItemData[] = Array.from(this.pinnedItems.values()).map(item => ({
      fsPath: item.fsPath,
      label: item.label,
      description: item.description,
      isSymlink: item.isSymlink,
      type: item.type
    }));
    
    this.context.workspaceState.update('pinnedItems', data);
  }
  
  /**
   * Load pinned items from workspace state
   */
  private loadPinnedItems(): void {
    // Check for migration from old format
    this.migrateOldData();
    
    const data = this.context.workspaceState.get<PinnedItemData[]>('pinnedItems', []);
    
    const validData = data.filter(item => {
      if (!item.fsPath || !item.label) {
        console.warn('Skipping invalid pinned item:', item);
        return false;
      }
      if (!item.type) {
        item.type = PinnedItemType.folder;
        console.log(`Set default type 'folder' for item: ${item.label}`);
      }
      return true;
    });
    
    if (validData.length !== data.length) {
      console.warn(`Filtered out ${data.length - validData.length} invalid items during load`);
      this.context.workspaceState.update('pinnedItems', validData);
    }
    
    this.pinnedItems.clear();
    for (const item of validData) {
      const pinnedItem = new PinnedItem(
        item.fsPath,
        item.label,
        item.description,
        item.isSymlink,
        item.type
      );
      this.pinnedItems.set(item.fsPath, pinnedItem);
    }
    
    console.log(`Loaded ${validData.length} pinned items`);
  }

  /**
   * Migrate old pinnedFolders data to new format
   */
  private migrateOldData(): void {
    const migrationVersion = this.context.workspaceState.get<number>('migrationVersion', 0);
    
    if (migrationVersion >= 1) {
      return; // Already migrated
    }

    const oldData = this.context.workspaceState.get<unknown[]>('pinnedFolders', []);
    const existingNewData = this.context.workspaceState.get<PinnedItemData[]>('pinnedItems', []);
    
    if (oldData.length > 0) {
      console.log(`Migrating ${oldData.length} items from old format`);
      
      const migratedData: PinnedItemData[] = [];
      const existingPaths = new Set(existingNewData.map(item => item.fsPath));
      
      for (const oldItem of oldData) {
        if (oldItem && typeof oldItem === 'object' && 'fsPath' in oldItem && 'label' in oldItem && 
            typeof (oldItem as Record<string, unknown>).fsPath === 'string' && 
            typeof (oldItem as Record<string, unknown>).label === 'string' && 
            !existingPaths.has((oldItem as Record<string, unknown>).fsPath as string)) {
          const item = oldItem as Record<string, unknown>;
          migratedData.push({
            fsPath: item.fsPath as string,
            label: item.label as string,
            description: (item.description as string) || (item.fsPath as string),
            isSymlink: (item.isSymlink as boolean) || false,
            type: PinnedItemType.folder // Old data was folders only
          });
        }
      }
      
      // Combine existing new data with migrated data
      const combinedData = [...existingNewData, ...migratedData];
      this.context.workspaceState.update('pinnedItems', combinedData);
      
      console.log(`Migrated ${migratedData.length} items to new format`);
    }
    
    // Mark migration as completed
    this.context.workspaceState.update('migrationVersion', 1);
    
    // Clean up old data
    this.context.workspaceState.update('pinnedFolders', undefined);
  }
}
