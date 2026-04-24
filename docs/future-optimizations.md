# 后续优化建议

## 创建时间: 2026-04-24

---

## 1. 元素截图预览增强

**当前状态:** 简化版，返回 null

**优化方向:**

- 集成 html2canvas 库实现真实元素截图
- 在 find_elements 返回前 3 个元素的截图预览
- 在确认对话框中显示元素截图 + 红色边框高亮
- 支持元素截图导出为 base64 PNG

**实现步骤:**

1. 添加 html2canvas 依赖: `npm install html2canvas`
2. 修改 `screenshot-utils.ts` 使用 html2canvas
3. 在 find_elements 中调用截图函数
4. ToolConfirmDialog 显示截图预览

---

## 2. 工具执行撤销功能

**当前状态:** 无撤销功能

**优化方向:**

- 支持撤销最近一次工具操作
- 对于 click_element: 记录点击前的状态，撤销时恢复
- 对于 fill_form: 记录填写前的值，撤销时恢复原值
- 对于 scroll_page: 记录滚动位置，撤销时恢复

**实现步骤:**

1. 在 ToolExecution 中添加 beforeState 字段
2. content script 执行前记录状态
3. 添加 UNDO_TOOL_OPERATION MessageType
4. UI 添加撤销按钮

---

## 3. 工具执行设置页面配置

**当前状态:** 无配置页面

**优化方向:**

- 设置页面添加"工具执行行为"配置
- 允许用户配置:
  - click_element: 每次确认 / 自动执行
  - fill_form: 每次确认 / 自动执行
  - scroll_page: 每次确认 / 自动执行
  - execute_script: 禁止 / 每次确认
- 支持全局配置和按网站配置

**实现步骤:**

1. SettingsPanel.vue 添加"工具执行"标签页
2. 扩展 Config 类型添加 toolExecutionConfig
3. content script 读取配置决定是否需要确认
4. ChatPanel 根据配置显示/隐藏确认对话框

---

## 4. 工具执行日志和统计

**当前状态:** 仅保存到 Conversation

**优化方向:**

- 工具执行历史独立页面展示
- 统计每个工具使用次数
- 显示工具执行成功率
- 导出工具执行日志为 JSON

**实现步骤:**

1. 创建独立的 ToolHistoryPanel.vue
2. storage 添加 toolHistory 存储
3. 添加工具执行统计计算
4. 添加导出功能

---

## 5. 多语言支持完善

**当前状态:** 部分 i18n

**优化方向:**

- 工具名称和描述多语言
- 确认对话框消息多语言
- 错误消息多语言
- ToolCallCard 状态文本多语言

**实现步骤:**

1. 扩展 locales/zh-CN.ts 和 locales/en-US.ts
2. ToolConfirmDialog 使用 $t() 函数
3. ToolCallCard 使用 $t() 函数
4. content-handlers.ts 错误消息多语言

---

## 6. 工具执行性能优化

**当前状态:** find_elements 默认 10 个元素

**优化方向:**

- 支持分页加载更多元素
- 元素分析结果缓存
- 批量操作优化
- 工具执行队列管理

---

## 7. 测试用例完善

**当前状态:** 231 tests passed

**待添加测试:**

- handleGetPageStructure 单元测试
- handleFindElements 单元测试（优先级排序、多 selector）
- UI 确认流程集成测试
- ToolCallCard 组件测试
- ToolConfirmDialog 组件测试
- useToolConfirm composable 测试

---

## 8. E2E 测试场景

**待添加 E2E 测试:**

- 工具调用展示场景
- 确认对话框交互场景
- 会话允许功能场景
- CSP 错误处理场景

---

## 9. 文档完善

**待添加文档:**

- 用户使用手册
- 工具列表和参数说明
- API 文档（handler 接口）
- 开发者指南

---

## 10. 其他优化

- 工具执行进度条显示
- 工具执行超时处理
- 工具执行重试机制
- 工具执行并发限制
- 工具执行依赖关系处理
