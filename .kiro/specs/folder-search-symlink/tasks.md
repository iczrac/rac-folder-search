# Implementation Plan: Folder Search with Symlink Support

## Overview

This implementation plan breaks down the development of the VS Code extension into discrete, manageable tasks. Each task builds on previous work, with testing integrated throughout to validate functionality incrementally.

## Tasks

- [ ] 
  - Initialize VS Code extension project using Yeoman generator
  - Configure TypeScript with strict mode
  - Set up testing framework (Jest and fast-check)
  - Create project directory structure (src/, src/test/)
  - Configure package.json with extension metadata
  - _Requirements: 12.1, 12.2_
- [ ] 
  - [ ] 2.1 Create SearchConfig interface and ConfigManager class

    - Define SearchConfig interface with all configuration fields
    - Implement ConfigManager.getConfig() to read VS Code settings
    - Implement ConfigManager.validateConfig() with validation rules
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  - [ ]* 2.2 Write property test for configuration validation

    - **Property 27: Configuration Application**
    - **Validates: Requirements 11.7**
  - [ ]* 2.3 Write unit tests for ConfigManager

    - Test default configuration values
    - Test configuration validation edge cases (maxDepth bounds, negative values)
    - Test invalid configuration rejection
    - _Requirements: 4.4, 6.5, 7.4, 8.4, 9.3_
- [ ] 
  - [ ] 3.1 Create CacheEntry interface and CacheManager class

    - Define CacheEntry interface with results and timestamp
    - Implement cache validity checking with expiration logic
    - Implement getOrBuild() with concurrent build prevention
    - Implement clear() method
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_
  - [ ]* 3.2 Write property test for cache hit behavior

    - **Property 14: Cache Hit Returns Same Results**
    - **Validates: Requirements 6.3**
  - [ ]* 3.3 Write property test for cache miss behavior

    - **Property 15: Cache Miss Triggers Rebuild**
    - **Validates: Requirements 6.4**
  - [ ]* 3.4 Write property test for concurrent cache builds

    - **Property 16: Concurrent Cache Build Prevention**
    - **Validates: Requirements 6.6**
  - [ ]* 3.5 Write unit tests for CacheManager

    - Test cache expiration calculation
    - Test manual cache clearing
    - _Requirements: 6.5_
- [ ] 
  - [ ] 4.1 Create ScanResult interface and FolderScanner class

    - Define ScanResult interface with label, description, fsPath, isFolder, isSymlink
    - Implement FolderScanner.scan() entry point
    - Implement scanDirectory() recursive function with depth tracking
    - Add visited set for circular reference detection using fs.realpathSync()
    - _Requirements: 2.1, 3.1, 3.2, 3.3, 4.1, 4.2_
  - [ ] 4.2 Implement symlink handling

    - Use fs.promises.stat() to follow symlinks (not lstat)
    - Detect symlinks using entry.isSymbolicLink()
    - Add 🔗 symbol to labels for symlink directories
    - Handle broken symlinks with try-catch
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.2_
  - [ ]* 4.3 Write property test for symlink following

    - **Property 5: Symlink Following and Indexing**
    - **Validates: Requirements 2.1, 2.4, 2.5**
  - [ ]* 4.4 Write property test for symlink visual indicator

    - **Property 6: Symlink Visual Indicator**
    - **Validates: Requirements 2.3**
  - [ ]* 4.5 Write property test for circular reference handling

    - **Property 7: Circular Reference Termination**
    - **Validates: Requirements 3.3, 3.4**
  - [ ]* 4.6 Write property test for broken symlink handling

    - **Property 25: Broken Symlink Handling**
    - **Validates: Requirements 10.2**
- [ ] 
  - [ ] 5.1 Add depth limit enforcement

    - Track currentDepth parameter in scanDirectory()
    - Stop recursion when depth exceeds config.maxDepth
    - _Requirements: 4.2, 4.3, 4.5_
  - [ ] 5.2 Add exclusion pattern filtering

    - Check directory names against config.excludePatterns
    - Skip hidden files/directories (starting with '.')
    - _Requirements: 8.2, 8.3, 8.5_
  - [ ]* 5.3 Write property test for depth limit

    - **Property 8: Depth Limit Enforcement**
    - **Validates: Requirements 4.3**
  - [ ]* 5.4 Write property test for configuration depth respect

    - **Property 9: Configuration Depth Respect**
    - **Validates: Requirements 4.5**
  - [ ]* 5.5 Write property test for exclude pattern filtering

    - **Property 20: Exclude Pattern Filtering**
    - **Validates: Requirements 8.3**
  - [ ]* 5.6 Write property test for hidden file exclusion

    - **Property 21: Hidden File Exclusion**
    - **Validates: Requirements 8.5**
- [ ] 
  - [ ] 6.1 Add file inclusion logic

    - Check config.includeFiles before adding files to results
    - Add file icon "$(file)" to file labels
    - Add folder icon "$(folder)" to folder labels
    - _Requirements: 7.1, 7.2, 1.5_
  - [ ] 6.2 Add result limiting

    - Check results.length against config.maxResults
    - Stop scanning when limit reached
    - _Requirements: 9.1, 9.2_
  - [ ]* 6.3 Write property test for file inclusion configuration

    - **Property 17: File Inclusion Configuration**
    - **Validates: Requirements 7.1**
  - [ ]* 6.4 Write property test for file icon presence

    - **Property 18: File Icon Presence**
    - **Validates: Requirements 7.2**
  - [ ]* 6.5 Write property test for folder icon presence

    - **Property 4: Folder Icon Presence**
    - **Validates: Requirements 1.5**
  - [ ]* 6.6 Write property test for result limit enforcement

    - **Property 22: Result Limit Enforcement**
    - **Validates: Requirements 9.2**
- [ ] 
  - [ ] 7.1 Add comprehensive error handling

    - Wrap all fs operations in try-catch blocks
    - Handle EACCES (permission denied) errors
    - Handle ENOENT (file not found) errors
    - Log warnings for skipped items
    - Continue scanning after errors
    - _Requirements: 10.1, 10.3, 10.5_
  - [ ]* 7.2 Write property test for filesystem error recovery

    - **Property 24: Error Recovery - Continue on Filesystem Error**
    - **Validates: Requirements 10.1**
  - [ ]* 7.3 Write property test for permission error handling

    - **Property 26: Permission Error Handling**
    - **Validates: Requirements 10.3**
  - [ ]* 7.4 Write unit tests for error scenarios

    - Test broken symlink handling
    - Test permission denied handling
    - Test file not found handling
    - _Requirements: 10.2, 10.3_
- [ ] 
  - Run all scanner-related tests
  - Verify symlink handling works correctly
  - Verify error handling is robust
  - Ask the user if questions arise
- [ ] 
  - [ ] 9.1 Create QuickPickManager class

    - Implement show() method to display QuickPick
    - Implement filterAndSort() method
    - Add relative path to description field
    - Limit displayed results to 100 items
    - _Requirements: 1.1, 1.2, 1.4, 9.5_
  - [ ] 9.2 Implement filtering logic

    - Filter by name and description (case-insensitive)
    - Support substring matching
    - _Requirements: 1.2_
  - [ ] 9.3 Implement sorting logic

    - Priority 1: Folders before files
    - Priority 2: Exact matches first
    - Priority 3: Prefix matches before substring matches
    - Priority 4: Shorter names first
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ]* 9.4 Write property test for query filtering

    - **Property 1: Query Filtering Correctness**
    - **Validates: Requirements 1.2**
  - [ ]* 9.5 Write property test for relative path in description

    - **Property 3: Relative Path in Description**
    - **Validates: Requirements 1.4**
  - [ ]* 9.6 Write property test for folders-first sorting

    - **Property 10: Sorting Priority - Folders First**
    - **Validates: Requirements 5.1**
  - [ ]* 9.7 Write property test for exact match sorting

    - **Property 11: Sorting Priority - Exact Match**
    - **Validates: Requirements 5.2**
  - [ ]* 9.8 Write property test for prefix match sorting

    - **Property 12: Sorting Priority - Prefix Match**
    - **Validates: Requirements 5.3**
  - [ ]* 9.9 Write property test for name length sorting

    - **Property 13: Sorting Priority - Name Length**
    - **Validates: Requirements 5.4**
  - [ ]* 9.10 Write property test for display limit

    - **Property 23: Display Limit Enforcement**
    - **Validates: Requirements 9.5**
  - [ ]* 9.11 Write unit tests for QuickPickManager

    - Test empty query handling
    - Test special character handling in queries
    - _Requirements: 1.2_
- [ ] 
  - [ ] 10.1 Implement folder selection handler

    - Execute 'revealInExplorer' command with folder URI
    - _Requirements: 1.3_
  - [ ] 10.2 Implement file selection handler

    - Open file in editor using vscode.window.showTextDocument()
    - _Requirements: 7.3_
  - [ ]* 10.3 Write property test for folder selection action

    - **Property 2: Folder Selection Action**
    - **Validates: Requirements 1.3**
  - [ ]* 10.4 Write property test for file selection action

    - **Property 19: File Selection Action**
    - **Validates: Requirements 7.3**
- [ ] 
  - [ ] 11.1 Create searchCommand.ts with executeSearch function

    - Check for workspace folders (show error if none)
    - Load and validate configuration
    - Show progress indicator during scan
    - Call cacheManager.getOrBuild() with scanner
    - Call quickPickManager.show() with results
    - Wire up selection handlers
    - _Requirements: 1.1, 13.3_
  - [ ] 11.2 Add multi-folder workspace support

    - Iterate through all workspace folders
    - Include workspace folder name in descriptions
    - Track visited paths per workspace folder
    - _Requirements: 13.1, 13.2, 13.4_
  - [ ]* 11.3 Write property test for multi-folder workspace scanning

    - **Property 29: Multi-Folder Workspace Scanning**
    - **Validates: Requirements 13.1**
  - [ ]* 11.4 Write property test for workspace folder in description

    - **Property 30: Workspace Folder in Description**
    - **Validates: Requirements 13.2**
  - [ ]* 11.5 Write unit tests for search command

    - Test empty workspace handling
    - Test invalid configuration handling
    - Test progress indicator display
    - _Requirements: 13.3_
- [ ] 
  - [ ] 12.1 Create extension.ts with activate() and deactivate()

    - Initialize global instances (cacheManager, configManager, scanner)
    - Register 'folder-search.search' command
    - Register 'folder-search.refreshCache' command
    - Set up command handlers
    - _Requirements: 12.1, 12.2, 12.3_
  - [ ] 12.2 Implement cache refresh command

    - Clear cache using cacheManager.clear()
    - Show notification to user
    - Optionally trigger immediate re-scan
    - _Requirements: 6.7, 12.4_
  - [ ]* 12.3 Write property test for cache refresh command

    - **Property 28: Cache Refresh Command**
    - **Validates: Requirements 12.4**
  - [ ]* 12.4 Write integration test for command registration

    - Test 'folder-search.search' command execution
    - Test 'folder-search.refreshCache' command execution
    - _Requirements: 12.3, 12.4_
- [ ] 
  - [ ] 13.1 Add extension metadata

    - Set name, displayName, description, version
    - Set publisher, repository, license
    - Add keywords for marketplace discoverability
    - _Requirements: 12.5_
  - [ ] 13.2 Add command contributions

    - Register 'folder-search.search' with title and category
    - Register 'folder-search.refreshCache' with title and category
    - _Requirements: 12.1, 12.2, 12.5_
  - [ ] 13.3 Add configuration contributions

    - Add fold-search.followSymlinks (boolean, default: true)
    - Add fold-search.maxDepth (number, 1-20, default: 10)
    - Add fold-search.includeFiles (boolean, default: true)
    - Add fold-search.cacheExpiryMinutes (number, default: 10)
    - Add fold-search.excludePatterns (array, default: ["node_modules", ".git", "dist", "build", "__pycache__"])
    - Add fold-search.maxResults (number, default: 10000)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
- [ ] 
  - Run complete test suite (unit + property tests)
  - Verify all 30 correctness properties pass
  - Check test coverage
  - Ask the user if questions arise
- [ ] 
  - [ ] 15.1 Write README.md

    - Add feature overview with screenshots
    - Add installation instructions
    - Add usage guide with examples
    - Document configuration options
    - Add troubleshooting section
    - _Requirements: All_
  - [ ] 15.2 Add inline code documentation

    - Add JSDoc comments to all public methods
    - Document complex algorithms (scanning, sorting)
    - Add usage examples in comments
    - _Requirements: All_
- [ ] 
  - [ ] 16.1 Test with real symlink scenarios

    - Create test workspace with symlinks
    - Test circular symlink handling
    - Test broken symlink handling
    - Test deep symlink chains
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.3, 3.4, 10.2_
  - [ ] 16.2 Test with large directory structures

    - Create workspace with 1700+ folders
    - Measure initial scan time (should be < 5 seconds)
    - Measure cached search time (should be < 100ms)
    - Monitor memory usage (should be < 100MB)
    - _Requirements: 9.2, 9.3_
  - [ ] 16.3 Test all configuration options

    - Test with followSymlinks disabled
    - Test with various maxDepth values
    - Test with includeFiles disabled
    - Test with custom excludePatterns
    - Test with different cacheExpiryMinutes
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_
  - [ ] 16.4 Test multi-folder workspaces

    - Create workspace with multiple root folders
    - Verify all folders are scanned
    - Verify workspace folder names in descriptions
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
- [ ] 
  - All tests passing (unit + property + integration)
  - Performance benchmarks met
  - Documentation complete
  - Manual testing complete
  - Ask the user if ready to package

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each property test should run for minimum 100 iterations
- Property tests are tagged with comments referencing design properties
- Use fast-check for property-based testing
- Use Jest or Mocha for unit testing
- All file system operations must be wrapped in try-catch
- Use async/await throughout for non-blocking operations
- Test with VS Code Extension Development Host (F5 in VS Code)
