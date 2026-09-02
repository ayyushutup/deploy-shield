const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');

function generateToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: process.env.JWT_TTL || '1h' });
}

function authenticateToken(req, res, next) {
  // allow health and login endpoints without token
  if (req.path === '/health' || req.path.startsWith('/auth/')) {
    return next();
  }
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = { generateToken, authenticateToken };
