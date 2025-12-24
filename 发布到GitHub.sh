#!/bin/bash

# RAC Folder Search - GitHub 发布脚本
# 使用方法：./发布到GitHub.sh 你的GitHub用户名

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  RAC Folder Search - GitHub 发布工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}❌ 错误：请提供 GitHub 用户名${NC}"
    echo -e "${YELLOW}使用方法：./发布到GitHub.sh 你的GitHub用户名${NC}"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_URL="https://github.com/${GITHUB_USERNAME}/rac-folder-search.git"

echo -e "${YELLOW}📝 GitHub 用户名：${GITHUB_USERNAME}${NC}"
echo -e "${YELLOW}📝 仓库地址：${REPO_URL}${NC}"
echo ""

# 步骤 1：检查是否已初始化 Git
echo -e "${BLUE}[1/6] 检查 Git 仓库...${NC}"
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Git 仓库已存在${NC}"
else
    echo -e "${YELLOW}⚠️  初始化 Git 仓库...${NC}"
    git init
    echo -e "${GREEN}✅ Git 仓库初始化完成${NC}"
fi
echo ""

# 步骤 2：添加远程仓库
echo -e "${BLUE}[2/6] 配置远程仓库...${NC}"
if git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  远程仓库已存在，更新 URL...${NC}"
    git remote set-url origin ${REPO_URL}
else
    git remote add origin ${REPO_URL}
fi
echo -e "${GREEN}✅ 远程仓库配置完成${NC}"
git remote -v
echo ""

# 步骤 3：添加文件
echo -e "${BLUE}[3/6] 添加文件到 Git...${NC}"
git add .
echo -e "${GREEN}✅ 文件添加完成${NC}"
echo ""

# 步骤 4：查看状态
echo -e "${BLUE}[4/6] 查看 Git 状态...${NC}"
git status --short
echo ""

# 步骤 5：提交
echo -e "${BLUE}[5/6] 提交更改...${NC}"
git commit -m "Initial commit: RAC Folder Search v1.0.2

- Fast folder search with symlink support
- Keyboard shortcut: Cmd+Alt+F / Ctrl+Alt+F
- Optimized for 1700+ folders (6ms scan time)
- Full Chinese and English documentation"
echo -e "${GREEN}✅ 提交完成${NC}"
echo ""

# 步骤 6：推送到 GitHub
echo -e "${BLUE}[6/6] 推送到 GitHub...${NC}"
echo -e "${YELLOW}⚠️  如果这是第一次推送，可能需要输入 GitHub 凭据${NC}"
echo -e "${YELLOW}⚠️  如果需要 Personal Access Token，请访问：${NC}"
echo -e "${YELLOW}    https://github.com/settings/tokens${NC}"
echo ""

git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✅ 发布成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${GREEN}📦 仓库地址：${NC}"
    echo -e "   https://github.com/${GITHUB_USERNAME}/rac-folder-search"
    echo ""
    echo -e "${GREEN}📝 下一步：${NC}"
    echo -e "   1. 访问仓库页面"
    echo -e "   2. 点击 'Releases' → 'Create a new release'"
    echo -e "   3. Tag: v1.0.2"
    echo -e "   4. 上传 rac-folder-search-1.0.2.vsix"
    echo -e "   5. 发布 Release"
    echo ""
    echo -e "${YELLOW}📚 详细步骤请查看：GitHub发布指南.md${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  ❌ 推送失败${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}可能的原因：${NC}"
    echo -e "   1. 需要配置 GitHub 认证"
    echo -e "   2. 仓库不存在（需要先在 GitHub 创建）"
    echo -e "   3. 没有推送权限"
    echo ""
    echo -e "${YELLOW}解决方案：${NC}"
    echo -e "   1. 访问 https://github.com/new 创建仓库"
    echo -e "   2. 配置 Personal Access Token"
    echo -e "   3. 查看详细说明：GitHub发布指南.md"
    echo ""
fi
