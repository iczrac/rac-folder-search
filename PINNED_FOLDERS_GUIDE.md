# Pinned Folders Feature Guide

## Overview

The Pinned Folders feature allows you to pin frequently-searched folders to a sidebar panel for quick access and batch processing. This is especially useful when you need to work with multiple related folders in sequence.

## How It Works

### 1. Pin a Folder

**From Search Results:**
1. Press `Cmd+Alt+F` (Mac) or `Ctrl+Alt+F` (Windows/Linux) to open the search
2. Search for a folder you want to pin
3. Click the **pin button** (📌) next to the folder name
4. You'll see a confirmation message: "Pinned: [folder-name]"

**Visual Indicators:**
- 📌 = Pin button (click to pin)
- 🔗 = Symlinked folder indicator
- 📌 prefix in search results = Already pinned

### 2. View Pinned Folders

Pinned folders appear in the **Explorer panel** (left sidebar):

1. Open the Explorer panel (if not already visible)
2. Look for the **"RAC Search Pinned Folders"** section
3. All your pinned folders are listed there

### 3. Open a Pinned Folder

Click on any pinned folder in the list to:
- Reveal it in the file explorer
- Navigate to that folder location

### 4. Unpin a Folder

**Method 1: From the Pinned Folders view**
1. Right-click on the folder in the Pinned Folders panel
2. Select "Unpin Folder"

**Method 2: Using the close button**
1. Hover over the folder in the Pinned Folders panel
2. Click the close icon (✕) that appears

### 5. Clear All Pinned Folders

1. Click the **clear button** (🗑️) in the Pinned Folders view title bar
2. Confirm when prompted

## Use Cases

### Batch Processing Case Folders

Scenario: You need to process multiple case folders from a large directory structure.

**Workflow:**
1. Search for "CASE001" → Pin it
2. Search for "CASE002" → Pin it
3. Search for "CASE003" → Pin it
4. Now all three cases are visible in the Pinned Folders panel
5. Click each one to open and process
6. After processing, unpin them one by one

### Working with Multiple Projects

Scenario: You're switching between several project folders frequently.

**Workflow:**
1. Pin your main project folder
2. Pin the documentation folder
3. Pin the test data folder
4. All are now instantly accessible in the sidebar
5. No need to search repeatedly

### Symlinked Directory Navigation

Scenario: You have a symlink to a large shared directory with many subfolders.

**Workflow:**
1. Search through the symlinked directory
2. Pin the folders you need to work with
3. The 🔗 indicator shows which folders are symlinked
4. Quick access without re-searching

## Features

### Persistence

- Pinned folders are saved automatically
- They persist across VS Code sessions
- Your pinned list is restored when you reopen VS Code

### Visual Indicators

- **📌** = Pin button in search results
- **🔗** = Symlinked folder indicator
- **📌 prefix** = Already pinned (shown in search results)

### Smart Sorting

Pinned folders are automatically sorted alphabetically for easy navigation.

### Context Menu

Right-click on a pinned folder to:
- Open the folder in Explorer
- Unpin the folder
- Copy the path (if supported by your VS Code version)

## Tips & Tricks

### Organize Your Workflow

1. Pin folders at the start of your work session
2. Process them in order
3. Unpin as you complete each one
4. This creates a natural workflow progression

### Use with Keyboard Shortcuts

- `Cmd+Alt+F` / `Ctrl+Alt+F` = Open search
- `Enter` = Select folder from search
- `Escape` = Close search without selecting

### Combine with Other Features

- Use the **Refresh Cache** command if your folder structure changes
- Combine with VS Code's built-in file search for comprehensive navigation
- Use with the **Exclude Patterns** setting to focus on relevant folders

## Troubleshooting

### Pinned folders not appearing

1. Check that the Explorer panel is visible (View → Explorer)
2. Look for "RAC Search Pinned Folders" section
3. If not visible, try refreshing VS Code

### Pinned folders not persisting

1. Ensure you're working in a workspace (not a single folder)
2. Check that VS Code has permission to save workspace state
3. Try reloading VS Code

### Can't pin a file

- Only folders can be pinned
- If you try to pin a file, you'll see a warning message
- Search for the parent folder instead

### Symlink indicator not showing

- The 🔗 indicator appears only for actual symlinked folders
- Regular folders won't show this indicator
- Check your folder structure to confirm it's a symlink

## Commands

All pinned folders commands are available in the Command Palette:

- **RAC Folder Search: Search Folders** - Open the search dialog
- **RAC Folder Search: Open Pinned Folder** - Open a pinned folder in Explorer
- **RAC Folder Search: Unpin Folder** - Remove a folder from pinned list
- **RAC Folder Search: Clear All Pinned Folders** - Remove all pinned folders
- **Folder Search: Refresh Folder Index Cache** - Rebuild the folder index

## Performance

- Pinning/unpinning is instant
- No performance impact on VS Code
- Pinned folders list is stored in workspace state (minimal memory usage)
- Works smoothly even with hundreds of pinned folders

## Limitations

- Only folders can be pinned (not files)
- Pinned folders are workspace-specific (different workspaces have different pinned lists)
- Maximum number of pinned folders is limited only by available memory

## Related Features

- **Search Folders**: Use `Cmd+Alt+F` to search for folders
- **Refresh Cache**: Manually rebuild the folder index
- **Configuration**: Customize search behavior in VS Code settings

