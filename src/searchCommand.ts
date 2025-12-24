import * as vscode from 'vscode';
import { ConfigManager } from './configManager';
import { CacheManager } from './cacheManager';
import { FolderScanner } from './folderScanner';
import { QuickPickManager } from './quickPickManager';
import { ScanResult } from './types';

/**
 * Executes the search command workflow
 */
export async function executeSearch(
  configManager: ConfigManager,
  cacheManager: CacheManager,
  scanner: FolderScanner,
  quickPickManager: QuickPickManager
): Promise<void> {
  // Check workspace
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage('Folder Search: No workspace folder open');
    return;
  }

  // Load configuration
  const config = configManager.getConfig();
  if (!configManager.validateConfig(config)) {
    return;
  }

  // Show progress and get/build cache
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Indexing folders...',
      cancellable: false
    },
    async () => {
      const results = await cacheManager.getOrBuild(
        () => scanner.scan(workspaceFolders, config),
        config.cacheExpiryMinutes
      );

      // Show QuickPick
      await quickPickManager.show(results, (item: ScanResult) => {
        handleSelection(item);
      });
    }
  );
}

/**
 * Handles user selection from QuickPick
 * @param item Selected scan result
 */
function handleSelection(item: ScanResult): void {
  const uri = vscode.Uri.file(item.fsPath);

  if (item.isFolder) {
    // Reveal folder in explorer
    vscode.commands.executeCommand('revealInExplorer', uri);
  } else {
    // Open file in editor
    vscode.window.showTextDocument(uri);
  }
}
