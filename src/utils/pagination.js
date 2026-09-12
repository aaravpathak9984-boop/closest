// Pagination Utility Helpers
const { pagination: config } = require('../config/appConfig');

// Get normalized pagination parameters from req.query
function getPaginationParams(query = {}) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) page = config.defaultPage;
  if (isNaN(limit) || limit < 1) limit = config.defaultLimit;
  if (limit > config.maxLimit) limit = config.maxLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// Calculate pagination summary metadata
function getPaginationResult(totalItems, page, limit) {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    currentPage: page,
    limit,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextPage: hasNextPage ? page + 1 : null,
    previousPage: hasPreviousPage ? page - 1 : null,
  };
}

module.exports = {
  getPaginationParams,
  getPaginationResult,
};
