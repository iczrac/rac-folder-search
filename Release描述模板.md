# Release 描述模板

## 📝 在 GitHub 创建 Release 时使用

复制下面的内容到 Release 描述框：

---

## 🎉 RAC Folder Search v1.0.2

Fast folder and file search with full symbolic link support for VS Code.

### ✨ Features

- 🔍 **Fast Search**: 6ms scan time for 1700+ folders
- ⌨️ **Keyboard Shortcut**: `Cmd+Alt+F` (Mac) / `Ctrl+Alt+F` (Windows/Linux)
- 🔗 **Symlink Support**: Full symbolic link support with circular reference detection
- 📊 **Smart Sorting**: Exact match, prefix match, and intelligent ranking
- 🚀 **Caching**: Instant subsequent searches (< 50ms)
- ⚙️ **Configurable**: Depth limit, exclude patterns, and more

### 📦 Installation

1. Download `rac-folder-search-1.0.2.vsix` from the assets below
2. Open VS Code
3. Press `Cmd+Shift+X` to open Extensions panel
4. Click `...` → "Install from VSIX..."
5. Select the downloaded `.vsix` file
6. Restart VS Code

### ⌨️ Usage

Press `Cmd+Alt+F` (Mac) or `Ctrl+Alt+F` (Windows/Linux) to open folder search.

Type your search query and press Enter to open the selected folder.

### 📚 Documentation

- [中文文档 (Chinese Documentation)](README.zh-CN.md)
- [快速开始 (Quick Start)](快速开始.md)
- [快捷键说明 (Keyboard Shortcuts)](快捷键说明.md)
- [完整配置指南 (Full Setup Guide)](FINAL_SETUP.md)

### 🔧 Configuration

Open VS Code settings (`Cmd+,`) and search for `fold-search`:

```json
{
  "fold-search.followSymlinks": true,      // Follow symbolic links
  "fold-search.maxDepth": 2,               // Maximum scan depth
  "fold-search.includeFiles": false,       // Show folders only
  "fold-search.cacheExpiryMinutes": 10,    // Cache expiry time
  "fold-search.maxResults": 5000           // Maximum items to index
}
```

### 📊 Performance

Tested with 1717 case folders:

- **Initial scan**: 6ms ⚡
- **Cached search**: < 50ms ⚡
- **Memory usage**: < 10MB ⚡

### 🆕 What's New in v1.0.2

- ✨ Renamed to "RAC Folder Search" for better branding
- ✨ Added keyboard shortcut: `Cmd+Alt+F` / `Ctrl+Alt+F`
- ✨ Updated all documentation with shortcut information
- ✨ Improved package metadata

### 📝 Requirements

- VS Code 1.75.0 or higher
- Node.js file system access

### 🐛 Known Issues

None reported yet. Please [open an issue](../../issues) if you encounter any problems.

### 📄 License

MIT License - see [LICENSE](LICENSE.txt) for details

### 🙏 Acknowledgments

Built with ❤️ for efficient folder navigation in VS Code.

---

## 🌟 Star this repo if you find it useful!

---

**Full Changelog**: https://github.com/你的用户名/rac-folder-search/commits/v1.0.2

---

## 📝 填写说明

在 GitHub Release 页面：

1. **Tag version**: `v1.0.2`
2. **Release title**: `RAC Folder Search v1.0.2`
3. **Description**: 复制上面的内容
4. **Attach binaries**: 上传 `rac-folder-search-1.0.2.vsix`
5. **勾选**: "Set as the latest release"
6. **点击**: "Publish release"

---

## 🎨 可选：添加截图

如果你有使用截图，可以在描述中添加：

```markdown
### 📸 Screenshots

![Search Demo](images/search-demo.png)
*Quick folder search with keyboard shortcut*

![Symlink Support](images/symlink-support.png)
*Symbolic links marked with 🔗*
```

记得先将截图上传到仓库的 `images/` 目录。
