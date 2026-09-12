// Generic Query Builder for MongoDB (Search, Filter, Allowlisted Sort)
function buildQuery(query = {}, options = {}) {
  const {
    searchFields = ['name'],
    filterFields = ['role', 'status', 'category', 'type'],
    sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name_asc: { name: 1 },
      name_desc: { name: -1 },
    },
  } = options;

  const mongoFilter = {};

  // 1. Generic Search handling (?search=term)
  const search = query.search ? query.search.trim() : '';
  if (search && searchFields.length > 0) {
    const searchRegex = new RegExp(search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
    mongoFilter.$or = searchFields.map((field) => ({
      [field]: searchRegex,
    }));
  }

  // 2. Filter handling (?status=active&category=health)
  filterFields.forEach((field) => {
    if (query[field] !== undefined && query[field] !== '') {
      const val = query[field];
      if (typeof val === 'string' && val.includes(',')) {
        mongoFilter[field] = { $in: val.split(',').map((v) => v.trim()) };
      } else {
        mongoFilter[field] = val;
      }
    }
  });

  // 3. Sort handling (?sort=newest) with strict allowlist
  let sortOption = { createdAt: -1 }; // Default to newest
  const requestedSort = query.sort ? query.sort.trim().toLowerCase() : 'newest';

  if (sortMap[requestedSort]) {
    sortOption = sortMap[requestedSort];
  }

  return {
    filter: mongoFilter,
    sort: sortOption,
    search,
    currentSort: requestedSort,
  };
}

module.exports = {
  buildQuery,
};
