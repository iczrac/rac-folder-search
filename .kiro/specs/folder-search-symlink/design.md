# Design Document: Folder Search with Symlink Support

## Overview

This design document describes a VS Code extension that enables fast folder and file searching with full symbolic link support. The extension addresses limitations in existing solutions by properly following symlinks and indexing their target directories, making it suitable for projects with complex directory structures involving symbolic links.

The extension provides a QuickPick interface for searching through workspace folders, with intelligent caching, configurable exclusion patterns, and robust error handling. It is specifically designed to handle large directory structures (1700+ folders) efficiently.

**Key Design Principles:**
- **Symlink-first**: Treat symbolic links as first-class citizens in the file system
- **Performance**: Use caching and async operations to maintain responsiveness
- **Safety**: Prevent infinite recursion through circular reference detection
- **Configurability**: Allow users to customize behavior through VS Code settings

## Architecture

The extension follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                     VS Code Extension Host                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌─────────────────┐              │
│  │  Extension   │────────▶│  Command        │              │
│  │  Activation  │         │  Registration   │              │
│  └──────────────┘         └────────┬────────┘              │
│                                     │                        │
│                                     ▼                        │
│                          ┌──────────────────┐               │
│                          │  Search Command  │               │
│                          │  Handler         │               │
│                          └────────┬─────────┘               │
│                                   │                          │
│                    ┌──────────────┼──────────────┐          │
│                    ▼              ▼              ▼          │
│           ┌────────────┐  ┌─────────────┐  ┌──────────┐   │
│           │  QuickPick │  │   Cache     │  │  Config  │   │
│           │  Manager   │  │   Manager   │  │  Manager │   │
│           └────────────┘  └──────┬──────┘  └──────────┘   │
│                                   │                          │
│                                   ▼                          │
│                          ┌─────────────────┐                │
│                          │  File System    │                │
│                          │  Scanner        │                │
│                          └─────────────────┘                │
│                                   │                          │
└───────────────────────────────────┼──────────────────────────┘
                                    ▼
                          ┌─────────────────┐
                          │  Node.js fs     │
                          │  Module         │
                          └─────────────────┘
```

**Component Responsibilities:**

1. **Extension Activation**: Entry point, registers commands and initializes components
2. **Command Handler**: Orchestrates the search workflow
3. **QuickPick Manager**: Manages the VS Code QuickPick UI
4. **Cache Manager**: Handles caching logic and cache invalidation
5. **Config Manager**: Reads and validates user configuration
6. **File System Scanner**: Traverses directories and handles symlinks

## Components and Interfaces

### 1. Extension Entry Point (`extension.ts`)

**Purpose**: Extension lifecycle management and command registration

**Interface**:
```typescript
export function activate(context: vscode.ExtensionContext): void
export function deactivate(): void
```

**Responsibilities**:
- Register commands (`folder-search.search`, `folder-search.refreshCache`)
- Initialize global state (cache manager, config manager)
- Set up file system watchers for cache invalidation
- Handle extension disposal

### 2. Configuration Manager (`configManager.ts`)

**Purpose**: Centralized configuration access with validation

**Interface**:
```typescript
interface SearchConfig {
  followSymlinks: boolean;
  maxDepth: number;
  includeFiles: boolean;
  cacheExpiryMinutes: number;
  excludePatterns: string[];
  maxResults: number;
}

class ConfigManager {
  getConfig(): SearchConfig;
  validateConfig(config: SearchConfig): boolean;
}
```

**Configuration Schema**:
- `followSymlinks`: boolean (default: true)
- `maxDepth`: number, 1-20 (default: 10)
- `includeFiles`: boolean (default: true)
- `cacheExpiryMinutes`: number (default: 10)
- `excludePatterns`: string[] (default: ["node_modules", ".git", "dist", "build", "__pycache__"])
- `maxResults`: number (default: 10000)

**Validation Rules**:
- `maxDepth` must be between 1 and 20
- `cacheExpiryMinutes` must be positive
- `maxResults` must be positive
- `excludePatterns` must be an array of strings

### 3. File System Scanner (`folderScanner.ts`)

**Purpose**: Traverse directory structure and collect folder/file information

**Interface**:
```typescript
interface ScanResult {
  label: string;           // Display label with icon
  description: string;     // Relative path
  fsPath: string;         // Absolute file system path
  isFolder: boolean;      // True for directories
  isSymlink: boolean;     // True for symbolic links
}

class FolderScanner {
  async scan(
    workspaceFolders: readonly vscode.WorkspaceFolder[],
    config: SearchConfig
  ): Promise<ScanResult[]>;
  
  private async scanDirectory(
    dirPath: string,
    relativePath: string,
    results: ScanResult[],
    visited: Set<string>,
    config: SearchConfig,
    currentDepth: number
  ): Promise<void>;
}
```

**Scanning Algorithm**:

1. **Initialization**:
   - Create empty results array
   - Create visited set for tracking real paths
   - For each workspace folder, start recursive scan

2. **Directory Scanning** (recursive):
   ```
   function scanDirectory(dirPath, relativePath, results, visited, config, depth):
     // Depth check
     if depth > config.maxDepth:
       return
     
     // Resolve real path for circular reference detection
     try:
       realPath = fs.realpathSync(dirPath)
     catch error:
       log warning and return
     
     // Circular reference check
     if visited.has(realPath):
       return
     visited.add(realPath)
     
     // Read directory entries
     try:
       entries = fs.readdir(dirPath, { withFileTypes: true })
     catch error:
       log warning and return
     
     for each entry in entries:
       // Skip hidden files
       if entry.name.startsWith('.'):
         continue
       
       // Skip excluded patterns
       if entry.name in config.excludePatterns:
         continue
       
       fullPath = path.join(dirPath, entry.name)
       
       // Determine if entry is a directory
       isDirectory = false
       isSymlink = entry.isSymbolicLink()
       
       if isSymlink and config.followSymlinks:
         try:
           stats = await fs.promises.stat(fullPath)  // Follows symlink
           isDirectory = stats.isDirectory()
         catch error:
           continue  // Skip broken symlinks
       else:
         isDirectory = entry.isDirectory()
       
       // Process directories
       if isDirectory:
         results.push({
           label: "$(folder) " + entry.name + (isSymlink ? " 🔗" : ""),
           description: relativePath,
           fsPath: fullPath,
           isFolder: true,
           isSymlink: isSymlink
         })
         
         // Recursive scan
         await scanDirectory(
           fullPath,
           path.join(relativePath, entry.name),
           results,
           visited,
           config,
           depth + 1
         )
       
       // Process files (if enabled)
       else if config.includeFiles:
         results.push({
           label: "$(file) " + entry.name,
           description: relativePath,
           fsPath: fullPath,
           isFolder: false,
           isSymlink: isSymlink
         })
       
       // Check result limit
       if results.length >= config.maxResults:
         return
   ```

**Key Implementation Details**:

- **Symlink Handling**: Use `fs.promises.stat()` (not `lstat()`) to follow symlinks
- **Real Path Resolution**: Use `fs.realpathSync()` to get canonical path for cycle detection
- **Error Handling**: Wrap all fs operations in try-catch, log warnings but continue
- **Async Operations**: Use async/await for non-blocking I/O
- **Early Termination**: Stop scanning when `maxResults` is reached

### 4. Cache Manager (`cacheManager.ts`)

**Purpose**: Manage scan result caching with time-based expiration

**Interface**:
```typescript
interface CacheEntry {
  results: ScanResult[];
  timestamp: number;
}

class CacheManager {
  private cache: CacheEntry | null;
  private buildPromise: Promise<ScanResult[]> | null;
  private isBuilding: boolean;
  
  async getOrBuild(
    builder: () => Promise<ScanResult[]>,
    expiryMinutes: number
  ): Promise<ScanResult[]>;
  
  isValid(expiryMinutes: number): boolean;
  clear(): void;
}
```

**Caching Logic**:

```
function getOrBuild(builder, expiryMinutes):
  // Check if cache is valid
  if cache exists and not expired:
    return cache.results
  
  // Prevent concurrent builds
  if isBuilding:
    await buildPromise
    return cache.results
  
  // Build new cache
  isBuilding = true
  buildPromise = builder()
  
  try:
    results = await buildPromise
    cache = {
      results: results,
      timestamp: Date.now()
    }
    return results
  finally:
    isBuilding = false
    buildPromise = null

function isValid(expiryMinutes):
  if cache is null:
    return false
  
  expiryMs = expiryMinutes * 60 * 1000
  age = Date.now() - cache.timestamp
  return age < expiryMs
```

**Cache Invalidation**:
- Time-based: Automatic expiration after `cacheExpiryMinutes`
- Manual: User-triggered via `folder-search.refreshCache` command
- File system events: Optional invalidation on workspace changes

### 5. QuickPick Manager (`quickPickManager.ts`)

**Purpose**: Manage QuickPick UI and user interactions

**Interface**:
```typescript
class QuickPickManager {
  async show(
    items: ScanResult[],
    onSelect: (item: ScanResult) => void
  ): Promise<void>;
  
  private filterAndSort(
    items: ScanResult[],
    query: string
  ): ScanResult[];
}
```

**Filtering Logic**:
```
function filterAndSort(items, query):
  if query is empty:
    return items.slice(0, 100)
  
  queryLower = query.toLowerCase()
  
  // Filter items
  filtered = items.filter(item => {
    name = basename(item.fsPath).toLowerCase()
    desc = item.description.toLowerCase()
    return name.includes(queryLower) or desc.includes(queryLower)
  })
  
  // Sort by relevance
  filtered.sort((a, b) => {
    // Priority 1: Folders before files
    if a.isFolder and not b.isFolder: return -1
    if not a.isFolder and b.isFolder: return 1
    
    aName = basename(a.fsPath).toLowerCase()
    bName = basename(b.fsPath).toLowerCase()
    
    // Priority 2: Exact match
    aExact = (aName === queryLower)
    bExact = (bName === queryLower)
    if aExact and not bExact: return -1
    if not aExact and bExact: return 1
    
    // Priority 3: Prefix match
    aStarts = aName.startsWith(queryLower)
    bStarts = bName.startsWith(queryLower)
    if aStarts and not bStarts: return -1
    if not aStarts and bStarts: return 1
    
    // Priority 4: Shorter names first
    return aName.length - bName.length
  })
  
  return filtered.slice(0, 100)
```

**User Actions**:
- **Select folder**: Reveal in file explorer using `vscode.commands.executeCommand('revealInExplorer', uri)`
- **Select file**: Open in editor using `vscode.window.showTextDocument(uri)`

### 6. Search Command Handler (`searchCommand.ts`)

**Purpose**: Orchestrate the search workflow

**Workflow**:
```
async function executeSearch():
  // 1. Check workspace
  workspaceFolders = vscode.workspace.workspaceFolders
  if not workspaceFolders or workspaceFolders.length === 0:
    show error message "No workspace folder open"
    return
  
  // 2. Load configuration
  config = configManager.getConfig()
  if not configManager.validateConfig(config):
    show error message "Invalid configuration"
    return
  
  // 3. Show progress indicator
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "Indexing folders...",
    cancellable: false
  }, async (progress) => {
    // 4. Get or build cache
    results = await cacheManager.getOrBuild(
      () => scanner.scan(workspaceFolders, config),
      config.cacheExpiryMinutes
    )
    
    // 5. Show QuickPick
    await quickPickManager.show(results, (item) => {
      if item.isFolder:
        uri = vscode.Uri.file(item.fsPath)
        vscode.commands.executeCommand('revealInExplorer', uri)
      else:
        uri = vscode.Uri.file(item.fsPath)
        vscode.window.showTextDocument(uri)
    })
  })
```

## Data Models

### ScanResult

Represents a single file or folder in the search results.

```typescript
interface ScanResult {
  // Display label with VS Code icon
  // Format: "$(folder) name 🔗" or "$(file) name"
  label: string;
  
  // Relative path from workspace root
  // Used as description in QuickPick
  description: string;
  
  // Absolute file system path
  // Used for file operations
  fsPath: string;
  
  // True if this is a directory
  isFolder: boolean;
  
  // True if this is a symbolic link
  isSymlink: boolean;
}
```

### SearchConfig

User configuration for search behavior.

```typescript
interface SearchConfig {
  // Whether to follow symbolic links
  followSymlinks: boolean;
  
  // Maximum directory depth to scan
  maxDepth: number;
  
  // Whether to include files in results
  includeFiles: boolean;
  
  // Cache expiration time in minutes
  cacheExpiryMinutes: number;
  
  // Directory names to exclude from scanning
  excludePatterns: string[];
  
  // Maximum number of results to collect
  maxResults: number;
}
```

### CacheEntry

Internal cache storage structure.

```typescript
interface CacheEntry {
  // Cached scan results
  results: ScanResult[];
  
  // Timestamp when cache was created (milliseconds since epoch)
  timestamp: number;
}
```

## Error Handling

### Error Categories

1. **File System Errors**:
   - Permission denied (EACCES)
   - File not found (ENOENT)
   - Broken symlinks
   - I/O errors

2. **Configuration Errors**:
   - Invalid configuration values
   - Missing required settings

3. **Runtime Errors**:
   - No workspace open
   - Out of memory
   - Unexpected exceptions

### Error Handling Strategy

**File System Errors**:
```typescript
try {
  const stats = await fs.promises.stat(fullPath);
  // Process stats
} catch (error) {
  if (error.code === 'EACCES') {
    console.warn(`Permission denied: ${fullPath}`);
  } else if (error.code === 'ENOENT') {
    console.warn(`File not found (broken symlink?): ${fullPath}`);
  } else {
    console.error(`Unexpected error scanning ${fullPath}:`, error);
  }
  // Continue with next entry
  return;
}
```

**Configuration Errors**:
```typescript
function validateConfig(config: SearchConfig): boolean {
  if (config.maxDepth < 1 || config.maxDepth > 20) {
    vscode.window.showErrorMessage(
      'Invalid maxDepth: must be between 1 and 20'
    );
    return false;
  }
  // ... other validations
  return true;
}
```

**User-Facing Errors**:
- Use `vscode.window.showErrorMessage()` for critical errors
- Use `vscode.window.showWarningMessage()` for non-critical issues
- Use `vscode.window.showInformationMessage()` for informational messages
- Log detailed errors to console for debugging

### Graceful Degradation

- **Broken symlinks**: Skip and continue scanning
- **Permission errors**: Skip directory and continue
- **Depth limit reached**: Stop recursion for that branch
- **Result limit reached**: Stop scanning and return partial results
- **Cache build failure**: Show error but allow retry

## Testing Strategy

The extension will use a dual testing approach combining unit tests and property-based tests to ensure correctness and robustness.

### Testing Framework

- **Unit Testing**: Jest or Mocha (VS Code standard)
- **Property-Based Testing**: fast-check
- **Integration Testing**: VS Code Extension Test Runner
- **Test Configuration**: Minimum 100 iterations per property test

### Unit Testing

Unit tests will focus on specific examples, edge cases, and integration points:

**Test Suites**:

1. **Configuration Manager Tests**:
   - Valid configuration loading
   - Invalid configuration rejection
   - Default value handling
   - Configuration validation edge cases

2. **Cache Manager Tests**:
   - Cache hit/miss scenarios
   - Expiration logic
   - Concurrent build prevention
   - Manual cache clearing

3. **QuickPick Manager Tests**:
   - Filtering logic with specific queries
   - Sorting priority verification
   - Empty query handling
   - Result limit enforcement

4. **File System Scanner Tests** (with mock fs):
   - Normal directory scanning
   - Symlink following
   - Broken symlink handling
   - Permission error handling
   - Depth limit enforcement
   - Exclude pattern matching

5. **Integration Tests**:
   - End-to-end command execution
   - QuickPick interaction
   - File/folder selection actions

### Property-Based Testing

Property tests will verify universal correctness properties across many generated inputs. Each property test will run for a minimum of 100 iterations and will be tagged with a comment referencing the design document property.

**Tag Format**: `// Feature: folder-search-symlink, Property {number}: {property_text}`

**Property Test Suites**:

1. **Scanner Properties**:
   - Test symlink handling across various directory structures
   - Test circular reference detection
   - Test depth limiting behavior
   - Test exclude pattern matching

2. **Cache Properties**:
   - Test cache validity across time ranges
   - Test concurrent access patterns

3. **Filtering Properties**:
   - Test sorting consistency
   - Test filter correctness

4. **Configuration Properties**:
   - Test configuration validation

### Test Data

**Mock Directory Structures**:
- Simple flat directory
- Nested directories (various depths)
- Directories with symlinks
- Circular symlink structures
- Mixed files and folders
- Large directory (1000+ entries)

**Test Symlink Scenarios**:
- Symlink to directory
- Symlink to file
- Broken symlink
- Circular symlink (A → B → A)
- Deep symlink chain (A → B → C → D)
- Symlink outside workspace

### Performance Testing

**Benchmarks**:
- Scan time for 1700+ folders: < 5 seconds
- Cache hit response time: < 100ms
- Memory usage: < 100MB for large workspaces
- QuickPick responsiveness: < 50ms filter time

**Performance Test Approach**:
- Create test workspace with 2000+ folders
- Measure initial scan time
- Measure cached search time
- Monitor memory usage during scan
- Profile CPU usage

### Testing Best Practices

- Mock file system operations for unit tests
- Use real file system for integration tests
- Test error paths explicitly
- Verify logging output for warnings
- Test with various VS Code versions
- Test on multiple platforms (macOS, Linux, Windows)


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Query Filtering Correctness

*For any* query string and any set of scan results, all items returned by the filter function should have either their name or description containing the query string (case-insensitive).

**Validates: Requirements 1.2**

### Property 2: Folder Selection Action

*For any* folder item selected from the QuickPick, the extension should execute the reveal command with the correct file system path.

**Validates: Requirements 1.3**

### Property 3: Relative Path in Description

*For any* scan result representing a folder or file, the description field should contain a valid relative path from the workspace root.

**Validates: Requirements 1.4**

### Property 4: Folder Icon Presence

*For any* scan result where `isFolder` is true, the label should contain the folder icon marker "$(folder)".

**Validates: Requirements 1.5**

### Property 5: Symlink Following and Indexing

*For any* directory structure containing symbolic links pointing to directories, when `followSymlinks` is enabled, the scanner should index both the symlink itself and all contents of the target directory recursively.

**Validates: Requirements 2.1, 2.4, 2.5**

### Property 6: Symlink Visual Indicator

*For any* scan result where `isSymlink` is true and `isFolder` is true, the label should contain the 🔗 symbol.

**Validates: Requirements 2.3**

### Property 7: Circular Reference Termination

*For any* directory structure containing circular symbolic links (A → B → A), the scanner should terminate without infinite recursion and without throwing errors.

**Validates: Requirements 3.3, 3.4**

### Property 8: Depth Limit Enforcement

*For any* directory structure and any configured `maxDepth` value, the scanner should not index any items at a depth greater than `maxDepth` from the workspace root.

**Validates: Requirements 4.3**

### Property 9: Configuration Depth Respect

*For any* configured `maxDepth` value between 1 and 20, the scanner should use that value as the maximum scanning depth.

**Validates: Requirements 4.5**

### Property 10: Sorting Priority - Folders First

*For any* list of mixed files and folders, after sorting, all items where `isFolder` is true should appear before all items where `isFolder` is false.

**Validates: Requirements 5.1**

### Property 11: Sorting Priority - Exact Match

*For any* query string and any list of results, after sorting, items with names exactly matching the query (case-insensitive) should appear before items with non-exact matches.

**Validates: Requirements 5.2**

### Property 12: Sorting Priority - Prefix Match

*For any* query string and any list of results, after sorting, items with names starting with the query should appear before items where the query appears as a substring.

**Validates: Requirements 5.3**

### Property 13: Sorting Priority - Name Length

*For any* two items with equal match quality (both exact, both prefix, or both substring), the item with the shorter name should appear first in the sorted results.

**Validates: Requirements 5.4**

### Property 14: Cache Hit Returns Same Results

*For any* valid (non-expired) cache, calling `getOrBuild` should return the cached results without invoking the builder function.

**Validates: Requirements 6.3**

### Property 15: Cache Miss Triggers Rebuild

*For any* expired or non-existent cache, calling `getOrBuild` should invoke the builder function and store the new results.

**Validates: Requirements 6.4**

### Property 16: Concurrent Cache Build Prevention

*For any* scenario where multiple searches are triggered simultaneously before the first scan completes, only one scan operation should execute, and all callers should receive the same results.

**Validates: Requirements 6.6**

### Property 17: File Inclusion Configuration

*For any* directory structure, when `includeFiles` is true, the scan results should contain both files and folders; when false, results should contain only folders.

**Validates: Requirements 7.1**

### Property 18: File Icon Presence

*For any* scan result where `isFolder` is false, the label should contain the file icon marker "$(file)".

**Validates: Requirements 7.2**

### Property 19: File Selection Action

*For any* file item selected from the QuickPick, the extension should open that file in the editor.

**Validates: Requirements 7.3**

### Property 20: Exclude Pattern Filtering

*For any* directory whose name appears in the `excludePatterns` configuration, that directory should not appear in the scan results, and its contents should not be indexed.

**Validates: Requirements 8.3**

### Property 21: Hidden File Exclusion

*For any* file or directory whose name starts with '.', that item should not appear in the scan results.

**Validates: Requirements 8.5**

### Property 22: Result Limit Enforcement

*For any* directory structure, the scanner should return no more than `maxResults` items, stopping the scan when this limit is reached.

**Validates: Requirements 9.2**

### Property 23: Display Limit Enforcement

*For any* set of scan results, the QuickPick should display no more than 100 items at a time.

**Validates: Requirements 9.5**

### Property 24: Error Recovery - Continue on Filesystem Error

*For any* directory structure where some directories have permission errors or other filesystem errors, the scanner should skip those directories and continue scanning other accessible directories without throwing exceptions.

**Validates: Requirements 10.1**

### Property 25: Broken Symlink Handling

*For any* directory structure containing broken symbolic links (pointing to non-existent targets), the scanner should skip those symlinks without crashing and continue scanning other items.

**Validates: Requirements 10.2**

### Property 26: Permission Error Handling

*For any* directory with insufficient read permissions, the scanner should skip that directory and continue scanning without throwing exceptions.

**Validates: Requirements 10.3**

### Property 27: Configuration Application

*For any* configuration change (maxDepth, includeFiles, excludePatterns, etc.), the next search operation should use the updated configuration values.

**Validates: Requirements 11.7**

### Property 28: Cache Refresh Command

*For any* cached state, executing the `folder-search.refreshCache` command should clear the cache and trigger a new scan on the next search.

**Validates: Requirements 12.4**

### Property 29: Multi-Folder Workspace Scanning

*For any* workspace containing multiple root folders, the scanner should index all folders and their contents, not just the first folder.

**Validates: Requirements 13.1**

### Property 30: Workspace Folder in Description

*For any* scan result in a multi-folder workspace, the description should include information identifying which workspace folder the item belongs to.

**Validates: Requirements 13.2**

---

## Summary

This design provides a robust, performant solution for folder searching with full symbolic link support. The modular architecture ensures maintainability, while the comprehensive error handling and caching mechanisms ensure reliability and performance.

**Key Technical Decisions:**
1. Use `fs.stat()` instead of `fs.lstat()` to follow symlinks
2. Use `fs.realpathSync()` for circular reference detection
3. Implement time-based caching with concurrent build prevention
4. Use async/await throughout for non-blocking operations
5. Implement multi-level sorting for optimal result relevance

**Testing Approach:**
- Unit tests for specific examples and edge cases
- Property-based tests (fast-check) for universal correctness properties
- Integration tests for end-to-end workflows
- Performance benchmarks for large directory structures

The design addresses all 13 requirements with 30 testable correctness properties, ensuring comprehensive validation of the extension's behavior.
