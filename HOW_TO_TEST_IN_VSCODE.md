# How to Test the Extension in VS Code

## Quick Start

### 1. Open the Project in VS Code

```bash
code .
```

### 2. Launch Extension Development Host

Press **F5** (or go to Run > Start Debugging)

This will:
- Compile the TypeScript code
- Launch a new VS Code window (Extension Development Host)
- Load your extension in that window

### 3. Test the Extension

In the new VS Code window:

1. **Open a workspace** (File > Open Folder)
   - You can use the `test-workspace` folder we created
   - Or use your own project with symlinks

2. **Trigger the search command**:
   - Press `Cmd+Shift+P` (or `Ctrl+Shift+P` on Windows/Linux)
   - Type "Search Folders"
   - Select "Folder Search: Search Folders (with Symlink Support)"

3. **Test the search**:
   - Start typing to filter results
   - Notice folders appear before files
   - Look for the 🔗 symbol on symlinked folders
   - Press Enter to reveal a folder or open a file

4. **Test cache refresh**:
   - Press `Cmd+Shift+P` again
   - Type "Refresh"
   - Select "Folder Search: Refresh Folder Index Cache"
   - You should see a notification that cache was cleared

## Testing with Your Real Symlink Scenario

### Your Use Case
You mentioned having a `cases` directory that's a symlink to a folder with 1700+ case folders.

### Test Steps

1. **Open your project** in the Extension Development Host window

2. **Run the search command**
   - First search will take a few seconds to index 1700+ folders
   - You'll see a progress notification

3. **Search for a case**:
   - Type "C2CAR2021" (or any case number)
   - Results should filter instantly
   - Exact matches appear first
   - Prefix matches appear next

4. **Verify symlink handling**:
   - The `cases` folder should show with 🔗
   - All subfolders inside `cases` should be searchable
   - No infinite recursion should occur

5. **Test caching**:
   - Close and reopen the search (within 10 minutes)
   - Should be instant (< 100ms)
   - After 10 minutes, it will re-scan automatically

## Debugging

### View Extension Logs

1. In the Extension Development Host window:
   - Go to View > Output
   - Select "Folder Search" from the dropdown (if available)
   - Or check the Debug Console in the main VS Code window

### Set Breakpoints

1. In the main VS Code window (where you opened the project):
   - Open any `.ts` file (e.g., `src/folderScanner.ts`)
   - Click in the gutter to set a breakpoint
   - Trigger the extension in the Development Host
   - Debugger will pause at your breakpoint

### Common Issues

**Extension not activating**:
- Check the Debug Console for errors
- Make sure `npm run compile` completed successfully
- Try reloading the Extension Development Host (Cmd+R or Ctrl+R)

**Symlinks not working**:
- Check that `fold-search.followSymlinks` is `true` in settings
- Verify symlink permissions on your system
- Check the console for permission errors

**Performance issues**:
- Reduce `fold-search.maxDepth` in settings
- Add more patterns to `fold-search.excludePatterns`
- Check if you're hitting the `fold-search.maxResults` limit

## Configuration Testing

### Test Different Configurations

1. **Open Settings** in the Extension Development Host:
   - Press `Cmd+,` (or `Ctrl+,`)
   - Search for "fold-search"

2. **Try different settings**:

   **Minimal scanning** (fast):
   ```json
   {
     "fold-search.maxDepth": 3,
     "fold-search.includeFiles": false,
     "fold-search.maxResults": 1000
   }
   ```

   **Maximum coverage** (slow but complete):
   ```json
   {
     "fold-search.maxDepth": 20,
     "fold-search.includeFiles": true,
     "fold-search.maxResults": 50000
   }
   ```

   **Folders only**:
   ```json
   {
     "fold-search.includeFiles": false
   }
   ```

3. **Refresh cache** after changing settings to see the effect

## Performance Testing

### Measure Scan Time

1. Open a large workspace (1000+ folders)
2. Clear cache (Refresh Cache command)
3. Run search command
4. Note the time shown in the progress notification
5. Expected: < 5 seconds for 10,000 items

### Measure Search Time

1. After initial scan, run search again
2. Type a query
3. Results should filter instantly (< 100ms)

## Test Checklist

Use this checklist to verify all features:

- [ ] Extension activates in Development Host
- [ ] Search command appears in Command Palette
- [ ] QuickPick opens when command is triggered
- [ ] Folders are listed with $(folder) icon
- [ ] Files are listed with $(file) icon (if includeFiles is true)
- [ ] Symlinked folders show 🔗 symbol
- [ ] Typing filters results
- [ ] Folders appear before files in results
- [ ] Exact matches appear first
- [ ] Prefix matches appear before substring matches
- [ ] Selecting a folder reveals it in explorer
- [ ] Selecting a file opens it in editor
- [ ] Refresh cache command works
- [ ] Cache notification appears
- [ ] Symlinks are followed (contents indexed)
- [ ] Circular symlinks don't cause infinite loop
- [ ] Hidden files/folders are excluded
- [ ] Excluded patterns are respected
- [ ] Depth limit is respected
- [ ] Result limit is respected

## Next Steps

After manual testing in VS Code:

1. **Package the extension**:
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```

2. **Install locally**:
   ```bash
   code --install-extension folder-search-symlink-0.0.1.vsix
   ```

3. **Use in your real projects**!

## Troubleshooting

### Extension Host Crashes

If the Extension Development Host crashes:
1. Check the Debug Console for stack traces
2. Look for infinite loops or memory issues
3. Add more logging to identify the problem
4. Reduce test data size

### Can't Find Extension Commands

If commands don't appear:
1. Check `package.json` - commands should be registered
2. Verify `activationEvents` includes your commands
3. Try reloading the window (Cmd+R or Ctrl+R)
4. Check for compilation errors

### Symlinks Not Working on Windows

Windows symlinks require admin privileges:
1. Run VS Code as administrator
2. Or use directory junctions instead of symlinks
3. Or test on macOS/Linux

## Getting Help

If you encounter issues:
1. Check the Debug Console for errors
2. Review the TEST_REPORT.md for known issues
3. Check the extension logs
4. Add console.log statements for debugging
5. Set breakpoints and step through code

---

**Happy Testing! 🚀**
