# 概念层级图谱

> 可视化展示概念之间的层级继承关系

## 快速开始

### 前置要求

- Node.js >= 18.x
- npm

### 安装

```bash
cd concept-hierarchy

# 安装依赖
npm install

# 初始化数据库
npx prisma db push
```

### 运行

```bash
#启动后端 (端口 3001) 和前端 (端口 5173)
npm run dev
```

## 项目结构

| 目录 | 说明 |
|------|------|
| `src/server/` | Fastify 后端 API |
| `src/client/` | React 前端应用 |
| `prisma/` | Prisma 数据库 Schema |

## License

MIT