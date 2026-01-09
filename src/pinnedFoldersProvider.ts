import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Represents a pinned folder item
 */
export interface PinnedFolder {
  /** Display name */
  label: string;
  /** Absolute file system path */
  fsPath: string;
  /** Whether this is a symlink */
  isSymlink: boolean;
}

/**
 * TreeView provider for pinned folders
 */
export class PinnedFoldersProvider implements vscode.TreeDataProvider<PinnedFolderItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<PinnedFolderItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private pinnedFolders: PinnedFolder[] = [];

  constructor(private context: vscode.ExtensionContext) {
    this.loadPinnedFolders();
  }

  /**
   * Refresh the tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get tree item for display
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

    return Promise.resolve(
      this.pinnedFolders.map(folder => new PinnedFolderItem(folder))
    );
  }

  /**
   * Add a folder to pinned list
   */
  async pinFolder(fsPath: string, isSymlink: boolean = false): Promise<void> {
    // Check if already pinned
    if (this.pinnedFolders.some(f => f.fsPath === fsPath)) {
      vscode.window.showInformationMessage('Folder is already pinned');
      return;
    }

    const label = path.basename(fsPath);
    this.pinnedFolders.push({ label, fsPath, isSymlink });
    await this.savePinnedFolders();
    this.refresh();
    vscode.window.showInformationMessage(`Pinned: ${label}`);
  }

  /**
   * Remove a folder from pinned list
   */
  async unpinFolder(fsPath: string): Promise<void> {
    const index = this.pinnedFolders.findIndex(f => f.fsPath === fsPath);
    if (index === -1) {
      return;
    }

    const folder = this.pinnedFolders[index];
    this.pinnedFolders.splice(index, 1);
    await this.savePinnedFolders();
    this.refresh();
    vscode.window.showInformationMessage(`Unpinned: ${folder.label}`);
  }

  /**
   * Clear all pinned folders
   */
  async clearAll(): Promise<void> {
    if (this.pinnedFolders.length === 0) {
      vscode.window.showInformationMessage('No pinned folders to clear');
      return;
    }

    const answer = await vscode.window.showWarningMessage(
      `Clear all ${this.pinnedFolders.length} pinned folders?`,
      'Yes',
      'No'
    );

    if (answer === 'Yes') {
      this.pinnedFolders = [];
      await this.savePinnedFolders();
      this.refresh();
      vscode.window.showInformationMessage('All pinned folders cleared');
    }
  }

  /**
   * Get all pinned folder paths
   */
  getPinnedFolderPaths(): string[] {
    return this.pinnedFolders.map(f => f.fsPath);
  }

  /**
   * Load pinned folders from storage
   */
  private loadPinnedFolders(): void {
    const stored = this.context.globalState.get<PinnedFolder[]>('pinnedFolders');
    if (stored) {
      this.pinnedFolders = stored;
    }
  }

  /**
   * Save pinned folders to storage
   */
  private async savePinnedFolders(): Promise<void> {
    await this.context.globalState.update('pinnedFolders', this.pinnedFolders);
  }
}

/**
 * Tree item for a pinned folder
 */
class PinnedFolderItem extends vscode.TreeItem {
  constructor(public readonly folder: PinnedFolder) {
    super(folder.label, vscode.TreeItemCollapsibleState.None);

    this.tooltip = folder.fsPath;
    this.description = folder.isSymlink ? '🔗' : '';
    this.contextValue = 'pinnedFolder';
    this.iconPath = new vscode.ThemeIcon('folder');
    
    // Click to open folder
    this.command = {
      command: 'revealInExplorer',
      title: 'Open Folder',
      arguments: [vscode.Uri.file(folder.fsPath)]
    };
  }
}
