# Changelog

All notable changes to the RAC Folder Search extension will be documented in this file.

## [1.0.2] - 2024-12-24

### Added
- Keyboard shortcut: `Cmd+Alt+F` (Mac) / `Ctrl+Alt+F` (Windows/Linux)
- Renamed to "RAC Folder Search" for better branding
- Enhanced configuration descriptions with detailed markdown
- Complete automation setup with GitHub Actions

### Changed
- Improved package metadata and repository information
- Updated all documentation with shortcut information
- Optimized default configuration values

### Performance
- Initial scan: 6ms for 1700+ folders
- Cached search: < 50ms
- Memory usage: < 10MB

## [1.0.1] - 2024-12-24

### Added
- Optimized depth control logic
- Enhanced configuration with detailed markdown descriptions
- Better defaults for typical use cases (maxDepth: 2, maxResults: 5000)

### Performance
- Scan time reduced from 326ms to 6ms for 1700+ folders
- Only indexes folders at specified depth level

## [1.0.0] - 2024-12-24

### Added
- Major improvements to depth control logic
- Better handling of large directory structures
- Improved documentation

## [0.0.2] - 2024-12-24

### Changed
- Increased default maxResults to 20000
- Better handling of nested folder structures

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
