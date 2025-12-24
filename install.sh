#!/bin/bash

# 一键安装脚本

echo "================================"
echo "Folder Search Extension Installer"
echo "================================"
echo ""

# 检查是否已安装 vsce
if ! command -v vsce &> /dev/null; then
    echo "📦 Installing vsce (VS Code Extension Manager)..."
    npm install -g @vscode/vsce
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install vsce"
        exit 1
    fi
    echo "✅ vsce installed"
    echo ""
fi

# 编译代码
echo "🔨 Compiling TypeScript..."
npm run compile
if [ $? -ne 0 ]; then
    echo "❌ Compilation failed"
    exit 1
fi
echo "✅ Compilation successful"
echo ""

# 打包扩展
echo "📦 Packaging extension..."
vsce package
if [ $? -ne 0 ]; then
    echo "❌ Packaging failed"
    exit 1
fi
echo "✅ Extension packaged"
echo ""

# 查找 .vsix 文件
VSIX_FILE=$(ls -t *.vsix 2>/dev/null | head -1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ No .vsix file found"
    exit 1
fi

echo "📦 Found: $VSIX_FILE"
echo ""

# 安装扩展
echo "🚀 Installing extension to VS Code..."
code --install-extension "$VSIX_FILE"
if [ $? -ne 0 ]; then
    echo "❌ Installation failed"
    exit 1
fi

echo ""
echo "================================"
echo "✅ Installation Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Restart VS Code"
echo "2. Press Cmd+Shift+P"
echo "3. Type 'Search Folders'"
echo "4. Start searching!"
echo ""
echo "Configuration tips:"
echo "- Press Cmd+, to open settings"
echo "- Search for 'fold-search'"
echo "- Adjust settings as needed"
echo ""
echo "For your 1715 case folders, recommended settings:"
echo "  fold-search.followSymlinks: true"
echo "  fold-search.maxDepth: 3"
echo "  fold-search.includeFiles: false"
echo "  fold-search.maxResults: 5000"
echo ""
