const express = require('express');
const bcrypt = require('bcryptjs');
const { read } = require('../db/store');

const router = express.Router();

router.get('/login', (req, res) => res.render('auth/login', { title: 'Login' }));

router.post('/login', async (req, res) => {
  const db = read();
  const user = db.users.find(u => u.email.toLowerCase() === String(req.body.email || '').toLowerCase());
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) {
    req.flash('error', 'Invalid login.');
    return res.redirect('/auth/login');
  }
  req.session.userId = user.id;
  const membership = db.tenantUsers.find(x => x.userId === user.id);
  if (membership) req.session.tenantId = membership.tenantId;
  res.redirect('/admin');
});

router.post('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));

module.exports = router;
