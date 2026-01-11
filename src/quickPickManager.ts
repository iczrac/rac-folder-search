import * as path from 'path';
import * as vscode from 'vscode';
import { ScanResult } from './types';
import { PinnedItemsProvider } from './pinnedItemsProvider';

/**
 * Manages QuickPick UI and user interactions
 */
export class QuickPickManager {
  /**
   * Shows QuickPick with search results
   * @param items All scan results
   * @param onSelect Callback when user selects an item
   * @param pinnedItemsProvider Provider for pinned items
   */
  async show(
    items: ScanResult[],
    onSelect: (item: ScanResult) => void,
    pinnedItemsProvider?: PinnedItemsProvider
  ): Promise<void> {
    const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem & { scanResult: ScanResult; buttons?: vscode.QuickInputButton[] }>();
    quickPick.placeholder = 'Search folders... (Enter to open, click pin icon to pin/unpin)';
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = false;
    quickPick.canSelectMany = false;

    // Function to create items with pin buttons
    const createItems = (results: ScanResult[]) => {
      return results.map(result => {
        const isPinned = pinnedItemsProvider && pinnedItemsProvider.isPinned(result.fsPath);
        
        const item: vscode.QuickPickItem & { scanResult: ScanResult; buttons?: vscode.QuickInputButton[] } = {
          label: isPinned ? `📌 ${result.label}` : result.label,
          description: result.description,
          scanResult: result
        };

        // Add pin button for both files and folders with appropriate tooltip
        if (pinnedItemsProvider) {
          const itemType = result.isFolder ? 'folder' : 'file';
          item.buttons = [
            {
              iconPath: new vscode.ThemeIcon(isPinned ? 'pinned' : 'pin'),
              tooltip: isPinned ? `Unpin ${itemType}` : `Pin ${itemType}`
            }
          ];
        }

        return item;
      });
    };

    // Function to refresh items
    const refreshItems = (query: string) => {
      const filtered = this.filterAndSort(items, query);
      const currentActive = quickPick.activeItems[0];
      const currentFsPath = currentActive && 'scanResult' in currentActive ? currentActive.scanResult.fsPath : null;
      
      quickPick.items = createItems(filtered);
      
      // Restore focus
      if (currentFsPath) {
        const newItems = quickPick.items;
        const sameItem = newItems.find(i => 
          'scanResult' in i && i.scanResult.fsPath === currentFsPath
        );
        if (sameItem) {
          quickPick.activeItems = [sameItem];
        }
      }
    };

    // Initial items
    refreshItems('');

    // Update items as user types
    quickPick.onDidChangeValue(value => {
      refreshItems(value);
    });

    // Handle item button clicks (pin/unpin)
    if (pinnedItemsProvider) {
      quickPick.onDidTriggerItemButton(async (event) => {
        const item = event.item as vscode.QuickPickItem & { scanResult: ScanResult };
        if (item && 'scanResult' in item) {
          const result = item.scanResult;
          const itemName = path.basename(result.fsPath);
          
          if (pinnedItemsProvider.isPinned(result.fsPath)) {
            // Unpin the item
            const pinnedItems = await pinnedItemsProvider.getChildren();
            const pinnedItem = pinnedItems.find(i => i.fsPath === result.fsPath);
            if (pinnedItem) {
              pinnedItemsProvider.unpinItem(pinnedItem);
            }
          } else {
            // Pin the item (auto-detect type and symlink status)
            await pinnedItemsProvider.pinItem(
              result.fsPath,
              itemName,
              result.description,
              result.isSymlink
            );
          }
          
          // Refresh the QuickPick items to reflect the new pinned state
          refreshItems(quickPick.value);
        }
      });
    }

    // Handle selection (Enter key)
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
   * @returns Filtered and sorted results (max 100)
   */
  private filterAndSort(
    items: ScanResult[],
    query: string
  ): ScanResult[] {
    // If no query, return first 100 items
    if (!query) {
      return items.slice(0, 100);
    }

    const queryLower = query.toLowerCase();

    // Filter items
    const filtered = items.filter(item => {
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
