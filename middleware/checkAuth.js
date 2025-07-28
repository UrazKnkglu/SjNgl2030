const jwt = require('jsonwebtoken');

if (!global.tokenBlacklist) global.tokenBlacklist = new Set();

function isTokenBlacklisted(token) {
  return global.tokenBlacklist.has(token);
}

function checkAuth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'no_token' });

  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ error: 'token_blacklisted' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

module.exports = checkAuth;
