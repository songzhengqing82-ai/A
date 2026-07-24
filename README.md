# 木鱼清单

一个使用纯 HTML、CSS 和原生 JavaScript 实现的中文待办清单。

## 本地使用

直接双击 `index.html` 即可打开，不需要安装依赖或启动开发服务器。

任务保存在浏览器的 `localStorage` 中，存储键为 `muyu-tasks`。

## 文件结构

- `index.html`：页面结构
- `styles.css`：界面和响应式样式
- `app.js`：待办交互与本地存储
- `build.mjs`：生成 Sites 发布文件的零依赖脚本

## 检查与构建

需要 Node.js 22 或更高版本：

```bash
npm test
npm run build
```
