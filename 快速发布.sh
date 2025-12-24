#!/bin/bash

# RAC Folder Search - 快速发布脚本
# 使用方法：./快速发布.sh

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 RAC Folder Search - 快速发布${NC}"
echo ""

# 1. 编译和打包
echo -e "${YELLOW}📦 编译和打包...${NC}"
npm run compile
npx vsce package --allow-missing-repository
echo -e "${GREEN}✅ 打包完成${NC}"

# 2. Git 操作
echo -e "${YELLOW}📝 提交到 Git...${NC}"
git add .
git commit -m "Release v1.0.2: RAC Folder Search" || echo "没有新的更改"
git push origin main
echo -e "${GREEN}✅ 代码已推送${NC}"

# 3. 创建 Tag（如果不存在）
echo -e "${YELLOW}🏷️  创建 Git Tag...${NC}"
if ! git tag | grep -q "v1.0.2"; then
    git tag -a "v1.0.2" -m "Release v1.0.2"
    git push origin "v1.0.2"
    echo -e "${GREEN}✅ Tag 已创建${NC}"
else
    echo -e "${YELLOW}⚠️  Tag v1.0.2 已存在${NC}"
fi

echo ""
echo -e "${GREEN}🎉 发布完成！${NC}"
echo -e "${GREEN}📦 文件: rac-folder-search-1.0.2.vsix${NC}"
echo -e "${GREEN}🔗 仓库: https://github.com/iczrac/rac-folder-search${NC}"
echo ""
echo -e "${YELLOW}💡 下一步：访问 GitHub 创建 Release 或运行 GitHub Actions${NC}"