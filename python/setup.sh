#!/bin/bash

# 输出彩色文本的函数
print_green() {
    echo -e "\033[0;32m$1\033[0m"
}

print_blue() {
    echo -e "\033[0;34m$1\033[0m"
}

print_red() {
    echo -e "\033[0;31m$1\033[0m"
}

# 检查Python是否已安装
if ! command -v python3 &> /dev/null; then
    print_red "错误: 未找到Python3，请先安装Python3"
    exit 1
fi

# 创建虚拟环境
print_blue "创建Python虚拟环境..."
python3 -m venv venv

# 激活虚拟环境
print_blue "激活虚拟环境..."
source venv/bin/activate

# 安装依赖
print_blue "安装依赖项..."
pip install -r requirements.txt

# 检查.env文件是否存在
if [ ! -f .env ]; then
    print_blue "创建.env文件..."
    cp .env.example .env
    print_green "请编辑.env文件填入您的OpenAI API密钥"
else
    print_green ".env文件已存在"
fi

print_green "安装完成！"
print_green "使用以下命令启动API服务: python run.py" 