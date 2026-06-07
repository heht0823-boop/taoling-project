/**
 * Pagination Utils - 分页工具函数
 * 提供分页参数解析和分页结果格式化功能
 */

/**
 * 最大每页条数限制
 */
const MAX_PAGE_SIZE = 100;

/**
 * 解析分页参数
 * @param {Object} query - 请求查询参数
 * @param {number} query.page - 页码（默认1）
 * @param {number} query.pageSize - 每页条数（默认12，范围1-100）
 * @returns {Object} 分页参数 {page, pageSize, limit, offset}
 */
const getPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const requestedPageSize = Number.parseInt(query.pageSize, 10) || 12;
  const pageSize = Math.min(Math.max(requestedPageSize, 1), MAX_PAGE_SIZE);
  return {
    page,
    pageSize,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
};

/**
 * 格式化分页结果
 * @param {Array} rows - 数据列表
 * @param {number} count - 总记录数
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页条数
 * @returns {Object} 分页结果 {list, pagination}
 */
const paged = (rows, count, page, pageSize) => ({
  list: rows,
  pagination: {
    page,
    pageSize,
    total: count,
  },
});

module.exports = { getPagination, paged };
