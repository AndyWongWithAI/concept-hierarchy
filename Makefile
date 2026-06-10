.PHONY: help install dev build test clean

help:
	@echo "可用命令:"
	@echo "  make install  - 安装依赖"
	@echo "  make dev      - 开发模式"
	@echo "  make build    - 构建项目"
	@echo "  make test     - 运行测试"
	@echo "  make clean    - 清理构建产物"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

test:
	npm test

clean:
	rm -rf dist build node_modules coverage
	find . -name "*.log" -delete