# 图片上传系统

一个基于React和Ant Design实现的图片上传系统，支持多图片上传、预览功能，并包含完整的后端图片接收服务。

## 功能特性

- 📷 多图片上传支持
- 👁️ 实时图片预览功能
- 📁 自动创建上传目录
- 📊 文件大小和格式校验
- 🎨 美观的用户界面

## 技术栈

- **前端**: React + Ant Design + Vite
- **后端**: Express + Multer

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动后端服务

```bash
cd server
node app.js
```

### 启动前端开发服务器

```bash
npm run dev
```

## 使用说明

1. 点击上传按钮或拖放图片到上传区域
2. 系统会自动预览上传的图片
3. 点击图片可以查看大图预览
4. 点击"提交并上传"按钮将图片发送到服务器
5. 上传成功后会显示成功提示

## 注意事项

- 仅支持JPG和PNG格式的图片
- 单个图片大小不能超过2MB
- 最多可以同时上传8张图片
- 上传的图片会保存在server/uploads目录下

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
