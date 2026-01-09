import * as vscode from 'vscode';

/**
 * Represents a pinned folder item in the tree view
 */
export class PinnedFolderItem extends vscode.TreeItem {
  constructor(
    public readonly fsPath: string,
    public readonly label: string,
    public readonly description: string,
    public readonly isSymlink: boolean
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    
    this.tooltip = fsPath;
    this.description = description;
    this.contextValue = 'pinnedFolder';
    
    // Set icon
    this.iconPath = new vscode.ThemeIcon(
      'folder',
      new vscode.ThemeColor('charts.blue')
    );
    
    // Add symlink indicator
    if (isSymlink) {
      this.label = `${label} 🔗`;
    }
    
    // Command to open folder
    this.command = {
      command: 'folder-search.openPinnedFolder',
      title: 'Open Folder',
      arguments: [this.fsPath]
    };
  }
}

/**
 * Tree data provider for pinned folders
 */
export class PinnedFoldersProvider implements vscode.TreeDataProvider<PinnedFolderItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<PinnedFolderItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  
  private pinnedFolders: Map<string, PinnedFolderItem> = new Map();
  private context: vscode.ExtensionContext;
  
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.loadPinnedFolders();
  }
  
  /**
   * Get tree item
   */
  getTreeItem(element: PinnedFolderItem): vscode.TreeItem {
    return element;
  }
  
  /**
   * Get children (root level items)
   */
  getChildren(element?: PinnedFolderItem): Thenable<PinnedFolderItem[]> {
    if (element) {
      return Promise.resolve([]);
    }
    
    // Return all pinned folders sorted by label
    const items = Array.from(this.pinnedFolders.values());
    items.sort((a, b) => a.label.localeCompare(b.label));
    return Promise.resolve(items);
  }
  
  /**
   * Pin a folder
   */
  pinFolder(fsPath: string, label: string, description: string, isSymlink: boolean): void {
    if (this.pinnedFolders.has(fsPath)) {
      vscode.window.showInformationMessage(`Folder "${label}" is already pinned`);
      return;
    }
    
    const item = new PinnedFolderItem(fsPath, label, description, isSymlink);
    this.pinnedFolders.set(fsPath, item);
    this.savePinnedFolders();
    this.refresh();
    
    vscode.window.showInformationMessage(`Pinned: ${label}`);
  }
  
  /**
   * Unpin a folder
   */
  unpinFolder(item: PinnedFolderItem): void {
    if (this.pinnedFolders.delete(item.fsPath)) {
      this.savePinnedFolders();
      this.refresh();
      vscode.window.showInformationMessage(`Unpinned: ${item.label}`);
    }
  }
  
  /**
   * Unpin all folders
   */
  unpinAll(): void {
    this.pinnedFolders.clear();
    this.savePinnedFolders();
    this.refresh();
    vscode.window.showInformationMessage('All folders unpinned');
  }
  
  /**
   * Check if a folder is pinned
   */
  isPinned(fsPath: string): boolean {
    return this.pinnedFolders.has(fsPath);
  }
  
  /**
   * Get count of pinned folders
   */
  getCount(): number {
    return this.pinnedFolders.size;
  }
  
  /**
   * Refresh tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  
  /**
   * Save pinned folders to workspace state
   */
  private savePinnedFolders(): void {
    const data = Array.from(this.pinnedFolders.values()).map(item => ({
      fsPath: item.fsPath,
      label: item.label,
      description: item.description,
      isSymlink: item.isSymlink
    }));
    
    this.context.workspaceState.update('pinnedFolders', data);
  }
  
  /**
   * Load pinned folders from workspace state
   */
  private loadPinnedFolders(): void {
    const data = this.context.workspaceState.get<Array<{
      fsPath: string;
      label: string;
      description: string;
      isSymlink: boolean;
    }>>('pinnedFolders', []);
    
    this.pinnedFolders.clear();
    for (const item of data) {
      const pinnedItem = new PinnedFolderItem(
        item.fsPath,
        item.label,
        item.description,
        item.isSymlink
      );
      this.pinnedFolders.set(item.fsPath, pinnedItem);
    }
  }
}
