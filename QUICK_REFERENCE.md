# RAC Folder Search - Quick Reference

## Keyboard Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Open Search | `Cmd+Alt+F` | `Ctrl+Alt+F` |

## Search Results

| Action | How |
|--------|-----|
| Pin folder | Click 📌 button |
| Select folder | Press `Enter` or click |
| Close search | Press `Escape` |

## Pinned Folders Panel

| Action | How |
|--------|-----|
| Open folder | Click on folder name |
| Unpin folder | Right-click → "Unpin Folder" or click ✕ |
| Clear all | Click 🗑️ button in title bar |

## Visual Indicators

| Symbol | Meaning |
|--------|---------|
| 📌 | Pin button (click to pin) |
| 🔗 | Symlinked folder |
| 📌 prefix | Already pinned |

## Commands (Command Palette)

- `Cmd+Shift+P` / `Ctrl+Shift+P` to open Command Palette

| Command | Purpose |
|---------|---------|
| Search Folders | Open search dialog |
| Refresh Folder Index Cache | Rebuild folder index |
| Open Pinned Folder | Open folder in Explorer |
| Unpin Folder | Remove from pinned list |
| Clear All Pinned Folders | Remove all pinned folders |

## Settings

Access via: VS Code Settings → Search "fold-search"

| Setting | Default | Purpose |
|---------|---------|---------|
| `fold-search.followSymlinks` | `true` | Follow symbolic links |
| `fold-search.maxDepth` | `2` | Scan depth (1-20) |
| `fold-search.includeFiles` | `false` | Include files in results |
| `fold-search.cacheExpiryMinutes` | `10` | Cache timeout |
| `fold-search.excludePatterns` | See below | Folders to skip |
| `fold-search.maxResults` | `5000` | Max items to index |

### Default Exclude Patterns
- `node_modules`
- `.git`
- `dist`
- `build`
- `__pycache__`

## Workflow Examples

### Example 1: Process Multiple Cases
1. Press `Cmd+Alt+F` (Mac) or `Ctrl+Alt+F` (Windows/Linux)
2. Search "CASE001" → Click 📌 to pin
3. Search "CASE002" → Click 📌 to pin
4. Search "CASE003" → Click 📌 to pin
5. Open Explorer panel → See all 3 cases in Pinned Folders
6. Click each case to process
7. Unpin after processing

### Example 2: Quick Project Navigation
1. Pin your main project folder
2. Pin documentation folder
3. Pin test data folder
4. All instantly accessible in sidebar
5. No need to search repeatedly

### Example 3: Work with Symlinked Directories
1. Search through symlinked directory
2. Pin folders you need (🔗 shows they're symlinked)
3. Quick access without re-searching
4. Unpin when done

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Pinned folders not showing | Check Explorer panel is visible |
| Can't pin a file | Only folders can be pinned |
| Symlink not detected | Check folder is actual symlink |
| Missing folders in search | Increase `maxDepth` or `maxResults` |
| Slow search | Reduce `maxDepth` or add to `excludePatterns` |

## Tips

- **Organize by workflow**: Pin folders at session start, unpin as you complete tasks
- **Use keyboard shortcuts**: `Cmd+Alt+F` is faster than Command Palette
- **Combine features**: Use search + pin for complex workflows
- **Refresh cache**: Use if folder structure changes significantly
- **Check settings**: Adjust `maxDepth` and `excludePatterns` for your project

## Performance

- **Search**: < 100ms (cached)
- **Pin/Unpin**: Instant
- **Initial scan**: < 5 seconds for 10,000+ items
- **Memory**: < 100MB for large workspaces

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate search results |
| `Enter` | Select item |
| `Escape` | Close search |
| `Cmd+Alt+F` | Open search |

## File Locations

- **Settings**: VS Code Settings → "fold-search"
- **Pinned folders**: Stored in workspace state (auto-saved)
- **Cache**: Stored in memory (expires after configured time)

## Getting Help

1. Check PINNED_FOLDERS_GUIDE.md for detailed documentation
2. Review README.md for feature overview
3. Check CHANGELOG.md for version history
4. Report issues on GitHub: https://github.com/iczrac/rac-folder-search

