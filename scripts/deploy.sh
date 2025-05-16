#!/bin/bash

# 定义颜色变量
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 重置颜色

# 打印分隔线
function print_separator() {
  echo -e "${BLUE}========================================${NC}"
}

# 打印标题
function print_title() {
  print_separator
  echo -e "${YELLOW}$1${NC}"
  print_separator
}

# 打印成功信息
function print_success() {
  echo -e "${GREEN}[SUCCESS] $1${NC}"
}

# 打印错误信息
function print_error() {
  echo -e "${RED}[ERROR] $1${NC}"
}

# 打印警告信息
function print_warning() {
  echo -e "${YELLOW}[WARNING] $1${NC}"
}

# 打印信息
function print_info() {
  echo -e "${BLUE}[INFO] $1${NC}"
}

# 构建项目
print_title "开始构建项目"
print_info "运行 npm run build..."
npm run build

# 检查构建是否成功
if [ $? -ne 0 ]; then
  print_error "构建失败，请检查错误信息"
  exit 1
else
  print_success "构建成功！"
fi

# 目标目录
TARGET_DIR="/var/www/agricultural-diagnostic-web"

# 检查目标目录是否存在
print_title "检查目标目录"
print_info "目标目录: $TARGET_DIR"
if [ ! -d "$TARGET_DIR" ]; then
  print_warning "目标目录不存在，正在创建..."
  sudo mkdir -p "$TARGET_DIR"
  print_success "目标目录创建完成！"
else
  print_info "目标目录已存在。"
fi

# 清空目标目录
print_title "清空目标目录"
print_info "正在清空目标目录..."
sudo rm -rf "$TARGET_DIR"/*
print_success "目标目录已清空！"

# 复制文件
print_title "复制文件到目标目录"
print_info "正在复制文件..."
sudo cp -r dist/* "$TARGET_DIR"/
print_success "文件复制完成！"

# 设置权限
print_title "设置文件权限"
print_info "正在设置权限..."
sudo chown -R www-data:www-data "$TARGET_DIR"
print_success "权限设置完成！"

print_title "部署完成"
print_success "项目已成功部署到 $TARGET_DIR"
