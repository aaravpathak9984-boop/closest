# Exam-Day Adaptation Workflow

This document outlines the exact step-by-step process for adapting this starter kit once the real-world problem statement is revealed during the exam.

---

## 1. Step-by-Step Adaptation Process

When the problem statement is handed out (e.g. Agriculture, Healthcare, Education, Railways, Transportation, Finance):

```
1. Read Problem Statement thoroughly
   ↓
2. Identify Actors & Roles (e.g. Doctor, Patient, Admin)
   ↓
3. Identify Entities & Relationships (e.g. Patient -> Appointment -> Prescription)
   ↓
4. Define Must-Have Features vs. Nice-to-Have Features
   ↓
5. Create Domain Mongoose Models (`src/models/DomainEntity.js`)
   ↓
6. Create Controllers & Services (`src/controllers/domainController.js`)
   ↓
7. Define Express Routes (`src/routes/domainRoutes.js` and mount in `src/routes/index.js`)
   ↓
8. Build EJS Views (`src/views/domain/index.ejs`) using existing layouts & design tokens
   ↓
9. Wire up Search, Filter, Sort & Pagination using `queryBuilder.js` and `pagination.js`
   ↓
10. Test End-to-End User Flow locally (`npm run dev`)
   ↓
11. Commit & Push to GitHub
   ↓
12. Verify Render Deployment (`GET /health` and Live Domain Flows)
```

---

## 2. Time-Pressure Priority Checklist

Under tight time limits, execute in strict priority order:

1. **Core Problem Solution**: The single primary workflow required by the problem statement.
2. **Working User Flow**: Ability for a user to complete the core action end-to-end.
3. **Database Integration**: Persistence in MongoDB Atlas via Mongoose models.
4. **Authentication & Roles**: Protect routes using existing `requireAuth` middleware.
5. **CRUD Operations**: Create, read, update, delete for domain entities.
6. **Search / Filter / Sort**: Use built-in `buildQuery()` helper for table filters.
7. **UI Polish**: Use built-in components (cards, badges, modals, toasts).
8. **Deployment Verification**: Verify live URL on Render.

> [!TIP]
> A smaller, fully working end-to-end product beats a larger unfinished application with broken routes.

---

## 3. Quick Code Snippet Templates for Exam Day

### Adding a Domain Model (`src/models/Item.js`)
```javascript
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    status: { type: String, enum: ['pending', 'active', 'closed'], default: 'pending' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
```

### Adding Search & Pagination in Controller
```javascript
const Item = require('../models/Item');
const { buildQuery } = require('../utils/queryBuilder');
const { getPaginationParams, getPaginationResult } = require('../utils/pagination');

exports.listItems = async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { filter, sort, search } = buildQuery(req.query, {
    searchFields: ['title', 'category'],
    filterFields: ['status', 'category'],
  });

  const totalItems = await Item.countDocuments(filter);
  const items = await Item.find(filter).sort(sort).skip(skip).limit(limit);

  res.render('items/index', {
    items,
    pagination: getPaginationResult(totalItems, page, limit),
    searchQuery: search,
  });
};
```
