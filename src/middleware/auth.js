const { read } = require('../db/store');

function attachUser(req, res, next) {
  const db = read();
  req.user = req.session.userId ? db.users.find(u => u.id === req.session.userId) : null;
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    req.flash('error', 'Please sign in.');
    return res.redirect('/auth/login');
  }
  next();
}

function requireOwner(req, res, next) {
  if (req.user?.platformRole === 'installer') return next();
  const membership = read().tenantUsers.find(tu => tu.userId === req.user.id && tu.tenantId === req.tenant.id);
  if (membership?.role === 'owner') return next();
  return res.status(403).render('errors/403', { title: 'Forbidden' });
}

module.exports = { attachUser, requireAuth, requireOwner };
