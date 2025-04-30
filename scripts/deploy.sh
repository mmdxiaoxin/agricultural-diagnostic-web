#!/bin/bash

# 构建项目
echo "开始构建项目..."
npm run build

# 检查构建是否成功
if [ $? -ne 0 ]; then
  echo "构建失败，请检查错误信息"
  exit 1
fi

# 目标目录
TARGET_DIR="/var/www/agricultural-diagnostic-web"

# 检查目标目录是否存在
if [ ! -d "$TARGET_DIR" ]; then
  echo "创建目标目录: $TARGET_DIR"
  sudo mkdir -p "$TARGET_DIR"
fi

# 清空目标目录
echo "清空目标目录..."
sudo rm -rf "$TARGET_DIR"/*

# 复制文件
echo "复制文件到目标目录..."
sudo cp -r dist/* "$TARGET_DIR"/

# 设置权限
echo "设置文件权限..."
sudo chown -R www-data:www-data "$TARGET_DIR"

echo "部署完成！"
