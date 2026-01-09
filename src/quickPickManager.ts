import * as path from 'path';
import * as vscode from 'vscode';
import { ScanResult } from './types';
import { PinnedFoldersProvider } from './pinnedFoldersProvider';

/**
 * Manages QuickPick UI and user interactions
 */
export class QuickPickManager {
  /**
   * Shows QuickPick with search results
   * @param items All scan results
   * @param onSelect Callback when user selects an item
   * @param pinnedFoldersProvider Provider for pinned folders
   */
  async show(
    items: ScanResult[],
    onSelect: (item: ScanResult) => void,
    pinnedFoldersProvider?: PinnedFoldersProvider
  ): Promise<void> {
    const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem & { scanResult: ScanResult }>();
    quickPick.placeholder = 'Search folders and files... (Click pin button to pin selected folder)';
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = false;

    // Add pin button if provider is available
    if (pinnedFoldersProvider) {
      quickPick.buttons = [
        {
          iconPath: new vscode.ThemeIcon('pin'),
          tooltip: 'Pin selected folder'
        }
      ];
    }

    // Initial items (limited to 100)
    quickPick.items = this.filterAndSort(items, '', pinnedFoldersProvider).map(result => ({
      label: result.label,
      description: result.description,
      scanResult: result
    }));

    // Update items as user types
    quickPick.onDidChangeValue(value => {
      quickPick.items = this.filterAndSort(items, value, pinnedFoldersProvider).map(result => ({
        label: result.label,
        description: result.description,
        scanResult: result
      }));
    });

    // Handle button clicks (pin)
    if (pinnedFoldersProvider) {
      quickPick.onDidTriggerButton(async () => {
        const selected = quickPick.activeItems[0];
        if (selected && 'scanResult' in selected) {
          const result = selected.scanResult;
          if (result.isFolder) {
            const folderName = path.basename(result.fsPath);
            pinnedFoldersProvider.pinFolder(
              result.fsPath,
              folderName,
              result.description,
              result.isSymlink
            );
          } else {
            vscode.window.showWarningMessage('Only folders can be pinned');
          }
        }
      });
    }

    // Handle selection
    quickPick.onDidAccept(() => {
      const selected = quickPick.selectedItems[0];
      if (selected && 'scanResult' in selected) {
        onSelect(selected.scanResult);
        quickPick.hide();
      }
    });

    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  }

  /**
   * Filters and sorts results based on query
   * @param items All scan results
   * @param query Search query
   * @param pinnedFoldersProvider Provider to check pinned status
   * @returns Filtered and sorted results (max 100)
   */
  private filterAndSort(
    items: ScanResult[],
    query: string,
    pinnedFoldersProvider?: PinnedFoldersProvider
  ): ScanResult[] {
    // Add pinned indicator to labels
    const itemsWithPinIndicator = items.map(item => {
      if (pinnedFoldersProvider && item.isFolder && pinnedFoldersProvider.isPinned(item.fsPath)) {
        return {
          ...item,
          label: `📌 ${item.label}`
        };
      }
      return item;
    });

    // If no query, return first 100 items
    if (!query) {
      return itemsWithPinIndicator.slice(0, 100);
    }

    const queryLower = query.toLowerCase();

    // Filter items
    const filtered = itemsWithPinIndicator.filter(item => {
      const name = path.basename(item.fsPath).toLowerCase();
      const desc = item.description.toLowerCase();
      return name.includes(queryLower) || desc.includes(queryLower);
    });

    // Sort by relevance
    filtered.sort((a, b) => {
      // Priority 1: Folders before files
      if (a.isFolder && !b.isFolder) {
        return -1;
      }
      if (!a.isFolder && b.isFolder) {
        return 1;
      }

      const aName = path.basename(a.fsPath).toLowerCase();
      const bName = path.basename(b.fsPath).toLowerCase();

      // Priority 2: Exact match
      const aExact = aName === queryLower;
      const bExact = bName === queryLower;
      if (aExact && !bExact) {
        return -1;
      }
      if (!aExact && bExact) {
        return 1;
      }

      // Priority 3: Prefix match
      const aStarts = aName.startsWith(queryLower);
      const bStarts = bName.startsWith(queryLower);
      if (aStarts && !bStarts) {
        return -1;
      }
      if (!aStarts && bStarts) {
        return 1;
      }

      // Priority 4: Shorter names first
      return aName.length - bName.length;
    });

    // Limit to 100 items
    return filtered.slice(0, 100);
  }
}
