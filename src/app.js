/**
 * Express Application Initialization & Middleware Setup.
 */
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const { mongoUri, sessionSecret, appName } = require('./config/env');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { getAndClearFlash } = require('./utils/flash');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for fast development & inline Google Fonts
  })
);

// Body Parsing Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve Static Assets from src/public
app.use(express.static(path.join(__dirname, 'public')));

// Configure EJS Templating Engine & Layouts
app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');

const mongoose = require('mongoose');

// Configure Express Session Storage with MongoStore
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      clientPromise: new Promise((resolve, reject) => {
        if (mongoose.connection.readyState === 1) {
          return resolve(mongoose.connection.getClient());
        }
        mongoose.connection.once('open', () => {
          resolve(mongoose.connection.getClient());
        });
        mongoose.connection.once('error', (err) => {
          reject(err);
        });
      }),
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60, // 14 days session retention
    }),
    cookie: {
      httpOnly: true, // Mitigate XSS cookie theft
      maxAge: 14 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production', // Secure cookies in production HTTPS
    },
  })
);

// Global Template Middleware: Makes currentUser, flash messages, appName, and path accessible in all EJS templates
app.use((req, res, next) => {
  res.locals.appName = appName;
  res.locals.path = req.path;
  res.locals.currentUser = req.session ? req.session.user : null;
  res.locals.flash = getAndClearFlash(req);
  next();
});

// Mount Centralized Router
app.use('/', routes);

// 404 Not Found Middleware
app.use(notFound);

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
