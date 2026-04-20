# 样式规范

## 概述

本文档定义了前端项目的样式规范，包括 CSS/SCSS 组织方式、命名规范、主题系统和响应式设计。

## 样式组织方式

### 目录结构

```
src/styles/
├── variables.scss      # CSS 变量
├── mixins.scss          # SCSS mixins
├── functions.scss       # SCSS 函数
├── base.scss            # 基础样式
├── components.scss      # 组件样式
├── utilities.scss       # 工具类
├── themes/              # 主题
│   ├── light.scss
│   └── dark.scss
└── index.scss           # 样式入口
```

### 样式入口文件

```scss
// styles/index.scss
@import './variables.scss';
@import './mixins.scss';
@import './functions.scss';
@import './base.scss';
@import './components.scss';
@import './utilities.scss';
```

## CSS 变量规范

### 变量命名

使用 `--` 前缀，按类别分组：

```scss
// 颜色变量
:root {
  // 主色
  --color-primary: #1890ff;
  --color-success: #52c52c;
  --color-warning: #faad14;
  --color-error: #f5222d;
  --color-info: #1890ff;

  // 中性色
  --color-text-primary: #262626;
  --color-text-secondary: #595959;
  --color-text-tertiary: #8c8c8c;
  --color-text-disabled: #bfbfbf;

  // 背景色
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-bg-tertiary: #fafafa;

  // 边框色
  --color-border-primary: #d9d9d9;
  --color-border-secondary: #e8e8e8;

  // 字体
  --font-family-base:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-family-code: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;

  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-xxl: 24px;

  // 间距
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;

  // 圆角
  --border-radius-sm: 2px;
  --border-radius-base: 4px;
  --border-radius-lg: 8px;
  --border-radius-full: 9999px;

  // 阴影
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  // 过渡
  --transition-fast: 150ms ease-in-out;
  --transition-base: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;

  // Z-index
  --z-index-dropdown: 1000;
  --z-index-sticky: 1020;
  --z-index-fixed: 1030;
  --z-index-modal-backdrop: 1040;
  --z-index-modal: 1050;
  --z-index-popover: 1060;
  --z-index-tooltip: 1070;
}
```

### 使用 CSS 变量

```scss
.component {
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-base);
  transition: all var(--transition-base);
}
```

## BEM 命名规范

### 基本语法

```
.block {}
.block__element {}
.block--modifier {}
.block__element--modifier {}
```

### 命名规则

- **Block**: 独立的实体，可以复用
- **Element**: Block 的组成部分，不能独立存在
- **Modifier**: 改变 Block 或 Element 的外观或行为

### 示例

```scss
// Block
.card {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-base);
  background: var(--color-bg-primary);

  // Element
  &__header {
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--color-border-primary);
  }

  &__title {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
  }

  &__body {
    padding: var(--spacing-md) 0;
  }

  &__footer {
    padding-top: var(--spacing-sm);
    border-top: 1px solid var(--color-border-primary);
  }

  // Modifier
  &--primary {
    border: 1px solid var(--color-primary);
  }

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  // Element Modifier
  &__title--center {
    text-align: center;
  }
}
```

### 使用示例

```vue
<template>
  <div class="card card--primary">
    <div class="card__header">
      <h3 class="card__title card__title--center">Card Title</h3>
    </div>
    <div class="card__body">Card content</div>
    <div class="card__footer">Card footer</div>
  </div>
</template>
```

## SCSS Mixins

### 响应式 Mixin

```scss
// mixins.scss
$breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1600px,
);

@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  } @else {
    @warn "Breakpoint `#{$breakpoint}` not found in `$breakpoints`.";
  }
}

@mixin respond-between($lower, $upper) {
  @if map-has-key($breakpoints, $lower) and map-has-key($breakpoints, $upper) {
    @media (min-width: map-get($breakpoints, $lower)) and (max-width: map-get($breakpoints, $upper) - 1px) {
      @content;
    }
  }
}
```

### 使用示例

```scss
.component {
  padding: var(--spacing-sm);

  @include respond-to(md) {
    padding: var(--spacing-md);
  }

  @include respond-to(lg) {
    padding: var(--spacing-lg);
  }
}
```

### 其他常用 Mixins

```scss
// 清除浮动
@mixin clearfix {
  &::after {
    content: '';
    display: table;
    clear: both;
  }
}

// 文本截断
@mixin text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 多行文本截断
@mixin text-truncate-multiline($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 居中
@mixin center-absolute {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@mixin center-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

// 按钮重置
@mixin button-reset {
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font: inherit;
}

// 隐藏滚动条
@mixin hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
```

## 响应式设计

### 断点标准

```scss
// 移动设备优先
$breakpoints: (
  xs: 0,
  // 手机竖屏
  sm: 576px,
  // 手机横屏
  md: 768px,
  // 平板
  lg: 992px,
  // 桌面
  xl: 1200px,
  // 大桌面
  xxl: 1600px, // 超大桌面
);
```

### 响应式策略

```scss
// 移动优先
.component {
  // 移动端样式
  padding: var(--spacing-sm);

  @include respond-to(md) {
    // 平板及以上
    padding: var(--spacing-md);
  }

  @include respond-to(lg) {
    // 桌面及以上
    padding: var(--spacing-lg);
  }
}
```

## 主题系统

### 主题变量

```scss
// themes/light.scss
:root {
  --color-primary: #1890ff;
  --color-text-primary: #262626;
  --color-bg-primary: #ffffff;
}

// themes/dark.scss
[data-theme='dark'] {
  --color-primary: #177ddc;
  --color-text-primary: #ffffff;
  --color-bg-primary: #1f1f1f;
}
```

### 主题切换

```typescript
// composables/useTheme.ts
import { ref, watch } from 'vue'

export function useTheme() {
  const theme = ref<'light' | 'dark'>('light')

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}
```

## 样式优先级规则

### 优先级顺序

1. `!important`（尽量避免使用）
2. 内联样式
3. ID 选择器
4. 类选择器、属性选择器、伪类选择器
5. 元素选择器、伪元素选择器

### 最佳实践

```scss
// ✅ 好：使用类选择器
.button {
  color: var(--color-primary);
}

// ❌ 差：使用 ID 选择器
#button {
  color: var(--color-primary);
}

// ❌ 差：使用 !important
.button {
  color: var(--color-primary) !important;
}
```

## 组件样式规范

### Scoped 样式

```vue
<template>
  <div class="my-component">Component content</div>
</template>

<style scoped lang="scss">
  .my-component {
    padding: var(--spacing-md);
  }
</style>
```

### CSS Modules

```vue
<template>
  <div :class="$style.myComponent">Component content</div>
</template>

<style module lang="scss">
  .myComponent {
    padding: var(--spacing-md);
  }
</style>
```

### 全局样式

```vue
<style lang="scss">
  // 不使用 scoped，样式会全局生效
  .global-style {
    // 全局样式
  }
</style>
```

## 性能优化

### 1. 避免深层嵌套

```scss
// ❌ 差：嵌套过深
.card {
  .header {
    .title {
      .text {
        color: var(--color-text-primary);
      }
    }
  }
}

// ✅ 好：扁平结构
.card {
  &__header {
    &__title {
      &__text {
        color: var(--color-text-primary);
      }
    }
  }
}
```

### 2. 使用 CSS 变量

```scss
// ✅ 好：使用 CSS 变量
.component {
  color: var(--color-primary);
  padding: var(--spacing-md);
}
```

### 3. 避免重复代码

```scss
// ❌ 差：重复代码
.button-primary {
  padding: 8px 16px;
  border-radius: 4px;
  background: var(--color-primary);
}

.button-secondary {
  padding: 8px 16px;
  border-radius: 4px;
  background: var(--color-secondary);
}

// ✅ 好：使用 mixin
@mixin button-base {
  padding: 8px 16px;
  border-radius: 4px;
}

.button-primary {
  @include button-base;
  background: var(--color-primary);
}

.button-secondary {
  @include button-base;
  background: var(--color-secondary);
}
```

### 4. 使用 will-change

```scss
.animated-element {
 {
  will-change: transform, opacity;
}
```

## 工具类

### 常用工具类

```scss
// utilities.scss
// 间距
.u-mt-xs {
  margin-top: var(--spacing-xs);
}
.u-mt-sm {
  margin-top: var(--spacing-sm);
}
.u-mt-md {
  margin-top: var(--spacing-md);
}
.u-mt-lg {
  margin-top: var(--spacing-lg);
}

.u-mb-xs {
  margin-bottom: var(--spacing-xs);
}
.u-mb-sm {
  margin-bottom: var(--spacing-sm);
}
.u-mb-md {
  margin-bottom: var(--spacing-md);
}
.u-mb-lg {
  margin-bottom: var(--spacing-lg);
}

// 文本
.u-text-center {
  text-align: center;
}
.u-text-left {
  text-align: left;
}
.u-text-right {
  text-align: right;
}

.u-text-truncate {
  @include text-truncate;
}

// 显示
.u-hidden {
  display: none;
}
.u-block {
  display: block;
}
.u-inline-block {
  display: inline-block;
}
.u-flex {
  display: flex;
}

// Flex
.u-flex-center {
  @include center-flex;
}

.u-flex-column {
  display: flex;
  flex-direction: column;
}
```

## 最佳实践

### 1. 使用语义化类名

```scss
// ✅ 好
.card {
}

// ❌ 差
.red-box {
}
```

### 2. 保持样式简洁

```scss
// ✅ 好
.button {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-base);
}

// ❌ 差
.button {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  color: #262626;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}
```

### 3. 使用相对单位

```scss
// ✅ 好
.container {
  width: 100%;
  max-width: 1200px;
  padding: 0 var(--spacing-md);
}

// ❌ 差
.container {
  width: 1200px;
  padding: 0 16px;
}
```

### 4. 避免魔法值

```scss
// ✅ 好
.component {
  padding: var(--spacing-md);
  color: var(--color-primary);
}

// ❌ 差
.component {
  padding: 16px;
  color: #1890ff;
}
```

## 检查清单

编写样式时，确保：

- [ ] 使用 BEM 命名规范
- [ ] 使用 CSS 变量
- [ ] 避免深层嵌套
- [ ] 避免重复代码
- [ ] 使用响应式设计
- [ ] 考虑性能优化
- [ ] 添加必要的注释
- [ ] 遵循主题系统

## 参考资源

- [BEM 官方网站](http://getbem.com/)
- [Sass 官方文档](https://sass-lang.com/documentation)
- [CSS 变量 MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
