# Incident: selection disappeared after pagination

## Situation

管理端标签选择框同时支持分页和已选项回显。最初已选标签直接依赖当前页的 options；切换页码或筛选后，上一页对象离开 options，UI 便丢失选中状态或无法正确回显。

## Task

分页、搜索和筛选可以替换当前页列表，但用户已选择的标签必须保持稳定，直到主动取消或提交完成。

## Action

- 把“当前页可选项”和“跨页已选对象”拆成两个状态源。
- 使用独立 `ref` 保存已选标签对象，以 ID 做去重和合并。
- 翻页只替换 options，不覆盖 selection。
- 提交时从独立 selection 生成标签 ID；重新打开编辑时先恢复对象，再加载当前页。
- 对页码、筛选和保存后的回显路径分别验证。

## Result

用户跨页选择、修改筛选和返回上一页后，已选标签仍保持稳定；当前页加载逻辑不再承担选择状态的生命周期。关键修复可回溯到提交 [`fb2c8f4`](https://github.com/heht0823-boop/taoling-project/commit/fb2c8f4)。

## What I learned

分页列表是服务端窗口，不是完整业务状态。只要一个状态需要跨页存在，就不能把它绑定到当前页数据的引用生命周期；应使用稳定 ID 和独立状态源表达。

## Prevention

- 组件接口明确区分 `options` 与 `modelValue/selectedItems`。
- 为跨页选择增加回归用例：选第一页、选第二页、修改筛选、取消其中一项、提交并重新打开。
- 列表刷新不得隐式清空 selection；清空必须是显式用户动作。
