# 概念层级图谱

可视化展示概念之间的层级继承关系，支持属性沿袭继承。

## 技术栈

- **前端**: React + TypeScript + Vite + React Force Graph
- **后端**: Node.js + Fastify + TypeScript
- **数据库**: SQLite + Prisma ORM
- **继承逻辑**: 后端计算，前端展示

## 项目目标

1. 图形式展示概念层级关系
2. 属性可沿袭继承（子节点自动拥有父节点属性）
3. 支持 CRUD 操作
4. 支持 100 → 几百个节点

## 代码规范

### 命名规范
- 目录: kebab-case
- 文件: kebab-case (React组件用 PascalCase)
- 变量/函数: camelCase

### 代码格式
- 缩进: 2 空格
- 单行最大长度: 100 字符

## 目录结构

```
concept-hierarchy/
├── src/
│   ├── server/          # Fastify 后端
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── db.ts
│   └── client/          # React 前端
│       ├── App.tsx
│       ├── main.tsx
│       └── ...
├── prisma/
│   └── schema.prisma
├── package.json
└── README.md
```

## API 设计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/concepts | 获取所有概念（含继承属性） |
| POST | /api/concepts | 创建新概念 |
| PUT | /api/concepts/:id | 更新概念 |
| DELETE | /api/concepts/:id | 删除概念 |

## 属性继承规则

- 继承属性: 灰色文字，带虚线下划线
- 自身属性: 深色文字，带实线下划线
- 自身属性会覆盖继承属性（如果 key 相同）