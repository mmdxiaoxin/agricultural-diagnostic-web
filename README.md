# 农业病害智能诊断系统

基于 React + TypeScript + Vite 构建的现代化农业病害诊断平台，为农业生产提供智能化的解决方案。

## 系统特点

- 🧠 **智能诊断**：基于深度学习算法，快速准确地识别作物病害，提供专业的诊断建议
- 📚 **知识库**：丰富的病害知识库，包含详细的病害信息、防治方法和用药建议
- 📊 **数据管理**：完善的数据管理系统，支持数据采集、存储、分析和可视化

## 主要功能

- **数据采集**：支持多种数据采集方式，包括图像、视频和传感器数据
- **数据管理**：高效管理农业数据，支持数据分类、标签和搜索
- **病害诊断**：基于 AI 的病害诊断系统，快速识别作物病害
- **图片分析**：专业的图像分析工具，支持多种图像处理功能
- **模型管理**：管理 AI 模型，支持模型训练、评估和部署
- **病害知识库**：丰富的病害知识库，包含详细的病害信息和防治方法
- **系统配置**：系统配置和管理，包括用户权限、系统参数等
- **用户管理**：用户账户管理，支持用户注册、权限分配等
- **诊断服务**：管理诊断服务，配置诊断服务调用

## 技术栈

### 核心框架

- ⚛️ [React 18](https://reactjs.org/) - 用于构建用户界面的 JavaScript 库
- 📘 [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集，添加了静态类型
- ⚡️ [Vite](https://vitejs.dev/) - 下一代前端构建工具

### UI 组件与样式

- 🎨 [Ant Design 5](https://ant.design/) - 企业级 UI 设计语言和 React UI 库
- 🎭 [Framer Motion](https://www.framer.com/motion/) - 强大的动画库
- 🎯 [TailwindCSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- 🎨 [Sass](https://sass-lang.com/) - CSS 预处理器

### 状态管理与路由

- 🔄 [Redux Toolkit](https://redux-toolkit.js.org/) - Redux 官方推荐的状态管理工具
- 🔄 [React Redux](https://react-redux.js.org/) - React 的 Redux 绑定库
- 🔄 [Redux Persist](https://github.com/rt2zz/redux-persist) - Redux 状态持久化
- 🛣️ [React Router](https://reactrouter.com/) - React 的路由库

### 工具与工具库

- 📊 [ECharts](https://echarts.apache.org/) - 强大的图表库
- 📝 [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 代码编辑器
- 📄 [html2canvas](https://html2canvas.hertzen.com/) - HTML 转 Canvas
- 📄 [jsPDF](https://parall.ax/products/jspdf) - PDF 生成库
- 🔍 [Lodash](https://lodash.com/) - 实用工具库
- 🔄 [Axios](https://axios-http.com/) - HTTP 客户端
- 📅 [Day.js](https://day.js.org/) - 日期处理库

### 开发工具

- 🛠️ [ESLint](https://eslint.org/) - 代码检查工具
- 💅 [Prettier](https://prettier.io/) - 代码格式化工具
- 📦 [PostCSS](https://postcss.org/) - CSS 转换工具
- 🖼️ [Vite Plugin Imagemin](https://github.com/anncwb/vite-plugin-imagemin) - 图片压缩插件
- 📦 [Vite Plugin Compression](https://github.com/anncwb/vite-plugin-compression) - Gzip 压缩插件

## 开始使用

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0

### 安装与运行

1. 克隆项目

```bash
git clone [项目地址]
```

2. 安装依赖

```bash
pnpm install
```

3. 启动开发服务器

```bash
pnpm dev
```

4. 构建生产版本

```bash
pnpm build
```

5. 预览生产版本

```bash
pnpm preview
```

6. 代码检查

```bash
pnpm lint
```

7. 代码格式化

```bash
pnpm prettier
```

## 项目结构

```
src/
├── assets/        # 静态资源
├── components/    # 公共组件
├── hooks/         # 自定义 Hooks
├── layouts/       # 布局组件
├── routes/        # 路由配置
├── services/      # API 服务
├── store/         # 状态管理
├── types/         # TypeScript 类型定义
├── utils/         # 工具函数
└── views/         # 页面组件
```

## 贡献指南

欢迎提交 Pull Request 或创建 Issue 来帮助改进项目。

## 许可证

本项目采用 [GNU Affero General Public License v3.0](LICENSE) 许可证。

该许可证要求：

1. 任何修改后的代码必须以相同的许可证发布
2. 如果通过网络提供服务，必须提供源代码
3. 必须保留原始版权声明和许可证
4. 必须包含完整的许可证文本

更多详细信息请查看 [LICENSE](LICENSE) 文件。
