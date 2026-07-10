const bcrypt = require('bcryptjs');
const store = require('../db');
async function verifyLogin(email, password) {
  const user = await store.findOne('users', u => u.email.toLowerCase() === String(email).toLowerCase() && u.active !== false);
  if (!user) return null;
  return await bcrypt.compare(password, user.password_hash) ? user : null;
}
module.exports = { verifyLogin };
