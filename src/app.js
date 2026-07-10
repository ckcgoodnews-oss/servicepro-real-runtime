const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const layouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');

const { attachUser, requireAuth } = require('./middleware/auth');
const { attachTenant } = require('./middleware/tenant');

const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(session({
  name: 'servicepro.sid',
  secret: process.env.SESSION_SECRET || 'development-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use(flash());
app.use(csrf());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(layouts);
app.set('layout', 'layouts/main');

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(attachUser);
app.use(attachTenant);

app.use((req, res, next) => {
  res.locals.appName = process.env.APP_NAME || 'ServicePro';
  res.locals.currentUser = req.user;
  res.locals.currentTenant = req.tenant;
  res.locals.csrfToken = req.csrfToken();
  res.locals.flash = {
    error: req.flash('error'),
    success: req.flash('success'),
    info: req.flash('info')
  };
  next();
});

app.use('/', publicRoutes);
app.use('/auth', authRoutes);
app.use('/admin', requireAuth, adminRoutes);

app.get('/healthz', (req, res) => res.json({ ok: true, sprint: 14 }));

app.use((req, res) => res.status(404).render('errors/404', { title: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'EBADCSRFTOKEN') return res.status(403).send('Invalid security token.');
  res.status(500).render('errors/500', { title: 'Server Error' });
});

module.exports = app;
