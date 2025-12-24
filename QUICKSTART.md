# Quick Start Guide

## For Users

### Installation

1. Download the `.vsix` file from releases
2. Open VS Code
3. Go to Extensions view (`Cmd+Shift+X` or `Ctrl+Shift+X`)
4. Click the `...` menu at the top
5. Select "Install from VSIX..."
6. Choose the downloaded `.vsix` file

### Usage

1. Open a workspace/folder in VS Code
2. Press `Cmd+Shift+P` (or `Ctrl+Shift+P` on Windows/Linux)
3. Type "Search Folders" and select the command
4. Start typing to search
5. Press Enter to open/reveal the selected item

### Tips

- The extension automatically caches results for 10 minutes
- Use the "Refresh Cache" command if your folder structure changes
- Configure exclusion patterns in settings to skip unwanted directories
- Symlinked folders are marked with 🔗

## For Developers

### Development Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile TypeScript
4. Press `F5` in VS Code to launch Extension Development Host

### Project Structure

```
folder-search-symlink/
├── src/
│   ├── extension.ts          # Extension entry point
│   ├── types.ts               # Type definitions
│   ├── configManager.ts       # Configuration management
│   ├── cacheManager.ts        # Cache management
│   ├── folderScanner.ts       # File system scanning
│   ├── quickPickManager.ts    # QuickPick UI
│   ├── searchCommand.ts       # Command handler
│   └── test/                  # Test files
├── out/                       # Compiled JavaScript
├── package.json               # Extension manifest
├── tsconfig.json              # TypeScript config
└── README.md                  # Documentation
```

### Key Components

1. **ConfigManager**: Reads and validates user settings
2. **CacheManager**: Manages scan result caching with expiration
3. **FolderScanner**: Traverses directories with symlink support
4. **QuickPickManager**: Handles UI and result filtering/sorting
5. **SearchCommand**: Orchestrates the search workflow

### Testing

Run tests with:
```bash
npm test
```

### Building

Build the extension:
```bash
npm run compile
```

Package for distribution:
```bash
npm install -g @vscode/vsce
vsce package
```

This creates a `.vsix` file you can install or distribute.

### Debugging

1. Set breakpoints in TypeScript files
2. Press `F5` to launch Extension Development Host
3. Trigger the extension in the new window
4. Debugger will stop at breakpoints

### Making Changes

1. Edit TypeScript files in `src/`
2. Run `npm run compile` or use watch mode: `npm run watch`
3. Reload Extension Development Host (`Cmd+R` or `Ctrl+R`)
4. Test your changes

### Key Implementation Details

**Symlink Handling:**
- Uses `fs.stat()` (not `fs.lstat()`) to follow symlinks
- Uses `fs.realpathSync()` for circular reference detection
- Gracefully handles broken symlinks

**Performance:**
- Async/await throughout for non-blocking operations
- Caching with configurable expiration
- Early termination when limits are reached
- Efficient sorting algorithm

**Error Handling:**
- All fs operations wrapped in try-catch
- Continues scanning after errors
- User-friendly error messages

## Configuration Examples

### Minimal Configuration (Fast Scanning)

```json
{
  "fold-search.maxDepth": 5,
  "fold-search.includeFiles": false,
  "fold-search.maxResults": 5000
}
```

### Maximum Coverage

```json
{
  "fold-search.maxDepth": 20,
  "fold-search.includeFiles": true,
  "fold-search.maxResults": 50000,
  "fold-search.excludePatterns": [".git"]
}
```

### Symlink-Only Mode

```json
{
  "fold-search.followSymlinks": true,
  "fold-search.excludePatterns": [
    "node_modules",
    ".git",
    "dist",
    "build",
    "src",
    "lib"
  ]
}
```

## Troubleshooting

### Extension not activating

Check the Output panel (View > Output) and select "Folder Search" from the dropdown.

### Symlinks not working

1. Verify `fold-search.followSymlinks` is `true`
2. Check symlink permissions on your system
3. Try the "Refresh Cache" command

### Performance issues

1. Reduce `fold-search.maxDepth`
2. Add more patterns to `fold-search.excludePatterns`
3. Reduce `fold-search.maxResults`
4. Disable file inclusion: `"fold-search.includeFiles": false`

### Cache not updating

Use the "Refresh Folder Index Cache" command to manually clear the cache.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT
