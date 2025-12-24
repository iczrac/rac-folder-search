import * as path from 'path';
import * as vscode from 'vscode';
import { ScanResult } from './types';

/**
 * Manages QuickPick UI and user interactions
 */
export class QuickPickManager {
  /**
   * Shows QuickPick with search results
   * @param items All scan results
   * @param onSelect Callback when user selects an item
   */
  async show(
    items: ScanResult[],
    onSelect: (item: ScanResult) => void
  ): Promise<void> {
    const quickPick = vscode.window.createQuickPick<vscode.QuickPickItem & { scanResult: ScanResult }>();
    quickPick.placeholder = 'Search folders and files...';
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = false;

    // Initial items (limited to 100)
    quickPick.items = this.filterAndSort(items, '').map(result => ({
      label: result.label,
      description: result.description,
      scanResult: result
    }));

    // Update items as user types
    quickPick.onDidChangeValue(value => {
      quickPick.items = this.filterAndSort(items, value).map(result => ({
        label: result.label,
        description: result.description,
        scanResult: result
      }));
    });

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
   * @returns Filtered and sorted results (max 100)
   */
  private filterAndSort(items: ScanResult[], query: string): ScanResult[] {
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
