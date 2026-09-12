/**
 * API Routes.
 * Provides JSON endpoint implementations for dynamic frontend queries.
 */
const express = require('express');
const router = express.Router();
const { apiRateLimiter } = require('../middleware/rateLimiter');
const { buildQuery } = require('../utils/queryBuilder');
const { getPaginationParams, getPaginationResult } = require('../utils/pagination');

router.use(apiRateLimiter);

// Sample JSON API endpoint demonstrating query utilities
router.get('/v1/data', (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const { search, currentSort } = buildQuery(req.query, {
    searchFields: ['name', 'description'],
    filterFields: ['status', 'category'],
  });

  res.json({
    success: true,
    meta: {
      search,
      sort: currentSort,
      ...getPaginationResult(25, page, limit),
    },
    data: [
      { id: 1, name: 'Sample Domain Item 1', status: 'active', category: 'general' },
      { id: 2, name: 'Sample Domain Item 2', status: 'pending', category: 'general' },
    ],
  });
});

module.exports = router;
