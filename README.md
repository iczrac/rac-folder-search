# Folder Search with Symlink Support

A VS Code extension that enables fast folder and file searching with **full symbolic link support**. Unlike other folder search extensions, this one properly follows symlinks and indexes their target directories, making it perfect for projects with complex directory structures.

## Features

- 🔍 **Fast Folder Search**: Quickly search through all folders in your workspace
- 🔗 **Symlink Support**: Follows symbolic links and indexes their contents
- 🚀 **Smart Caching**: Caches results for instant subsequent searches
- 📊 **Intelligent Sorting**: Results sorted by relevance (exact match, prefix match, etc.)
- ⚙️ **Highly Configurable**: Customize depth, exclusions, and more
- 🛡️ **Robust Error Handling**: Handles broken symlinks, permission errors gracefully
- 📁 **Multi-Folder Workspaces**: Works seamlessly with multi-root workspaces

## Usage

### Search Folders

1. Open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type "Search Folders" and select **"Folder Search: Search Folders (with Symlink Support)"**
3. Start typing to filter results
4. Select a folder to reveal it in the file explorer, or a file to open it

### Refresh Cache

If your folder structure changes significantly, you can manually refresh the cache:

1. Open the Command Palette
2. Type "Refresh" and select **"Folder Search: Refresh Folder Index Cache"**

## Configuration

Configure the extension through VS Code settings:

```json
{
  // Whether to follow symbolic links (default: true)
  "fold-search.followSymlinks": true,
  
  // Maximum directory depth to scan (default: 10, range: 1-20)
  "fold-search.maxDepth": 10,
  
  // Include files in search results (default: true)
  "fold-search.includeFiles": true,
  
  // Cache expiration time in minutes (default: 10)
  "fold-search.cacheExpiryMinutes": 10,
  
  // Directory names to exclude (default: ["node_modules", ".git", "dist", "build", "__pycache__"])
  "fold-search.excludePatterns": [
    "node_modules",
    ".git",
    "dist",
    "build",
    "__pycache__"
  ],
  
  // Maximum number of items to index (default: 10000)
  "fold-search.maxResults": 10000
}
```

## Why This Extension?

### The Symlink Problem

Many folder search extensions fail to properly handle symbolic links. They either:
- Don't follow symlinks at all (missing content)
- Follow symlinks but crash on circular references
- Follow symlinks but have poor performance

### Our Solution

This extension:
- ✅ Follows symlinks using `fs.stat()` (not `fs.lstat()`)
- ✅ Detects circular references using real path resolution
- ✅ Handles broken symlinks gracefully
- ✅ Marks symlinked folders with 🔗 for easy identification
- ✅ Maintains excellent performance with caching

## Use Cases

Perfect for projects with:
- Symbolic links to shared directories
- Monorepo structures with linked packages
- Development environments with mounted volumes
- Projects referencing external resources

## Example Scenario

If you have a project structure like:

```
my-project/
├── src/
├── cases -> /Users/admin/Documents/SharedFiles/Cases/
└── node_modules/
```

Where `cases` is a symlink to a directory with 1700+ case folders, this extension will:
1. Follow the symlink
2. Index all case folders
3. Let you search them instantly (e.g., search "C2CAR2021" to find matching cases)
4. Cache results for fast subsequent searches

## Performance

- **Initial scan**: < 5 seconds for 10,000+ items
- **Cached search**: < 100ms response time
- **Memory usage**: < 100MB for large workspaces

## Requirements

- VS Code 1.75.0 or higher
- Node.js file system access

## Known Limitations

- Hidden files and directories (starting with `.`) are automatically excluded
- Directories in the exclude list are skipped
- Maximum depth is capped at 20 levels to prevent performance issues

## Troubleshooting

### Symlinks not being followed

Check that `fold-search.followSymlinks` is set to `true` in your settings.

### Missing folders

1. Check if the folder name is in `fold-search.excludePatterns`
2. Verify the folder depth doesn't exceed `fold-search.maxDepth`
3. Try refreshing the cache

### Performance issues

1. Reduce `fold-search.maxDepth` to limit scanning depth
2. Add more patterns to `fold-search.excludePatterns`
3. Reduce `fold-search.maxResults` if you have a very large workspace

## Contributing

Issues and pull requests are welcome! Please report any bugs or feature requests on the GitHub repository.

## License

MIT

## Release Notes

### 1.0.1

Optimized version:
- **Performance boost**: Scan time reduced from 326ms to 6ms for 1700+ folders
- **Depth control optimization**: Only indexes folders at specified depth level
- **Enhanced configuration**: All settings now have detailed markdown descriptions
- **Default optimization**: Better defaults for typical use cases (maxDepth: 2, maxResults: 5000)

### 1.0.0

Major improvements:
- Optimized depth control logic
- Better handling of large directory structures
- Improved documentation

### 0.0.2

- Increased default maxResults to 20000
- Better handling of nested folder structures

### 0.0.1

Initial release:
- Full symbolic link support
- Intelligent caching
- Smart sorting
- Configurable exclusions
- Multi-folder workspace support
