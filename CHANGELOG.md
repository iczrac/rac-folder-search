# Change Log

All notable changes to the "folder-search-symlink" extension will be documented in this file.

## [0.0.1] - 2024-12-23

### Added
- Initial release
- Full symbolic link support with circular reference detection
- Intelligent caching system with configurable expiration
- Smart sorting (folders first, exact match, prefix match, name length)
- Configurable exclusion patterns
- Multi-folder workspace support
- Robust error handling for broken symlinks and permission errors
- Progress indicator during initial scan
- Manual cache refresh command
- Support for up to 10,000 indexed items by default
- Configurable maximum scan depth (1-20 levels)
- Optional file inclusion in search results

### Features
- Search folders and files with QuickPick interface
- Follow symbolic links and index their contents
- Visual indicator (🔗) for symlinked folders
- Automatic exclusion of hidden files and common build directories
- Fast cached searches (< 100ms response time)
- Efficient initial scanning (< 5 seconds for 10,000+ items)
