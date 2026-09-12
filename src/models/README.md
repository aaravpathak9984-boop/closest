# Database Models Guide

This directory contains the Mongoose schemas and models for the application.

## Pre-existing Models
- `User.js`: Base authentication model supporting password hashing, email normalization, role management, and timestamps.

## Exam-Day Instructions: Adding Domain Models

When the hackathon problem statement is announced, follow these guidelines to create domain models:

1. **Identify Entities**: Create one `.js` file per major domain entity in `src/models/` (e.g., `Patient.js`, `Crop.js`, `Ticket.js`, `Transaction.js`).
2. **Standard Mongoose Template**:
   ```javascript
   const mongoose = require('mongoose');

   const exampleSchema = new mongoose.Schema(
     {
       title: { type: String, required: true, trim: true },
       status: { type: String, enum: ['active', 'pending', 'completed'], default: 'pending' },
       user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     },
     { timestamps: true }
   );

   module.exports = mongoose.model('Example', exampleSchema);
   ```
3. **Relationships**: Reference `User` or other models using `type: mongoose.Schema.Types.ObjectId, ref: 'ModelName'`.
4. **Indexes**: Add `unique: true` or `.index()` on frequently queried or filtered fields to ensure high query performance during evaluation.
