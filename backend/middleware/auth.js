const jwt = require('jsonwebtoken');

// Shared JWT auth guard. Reads a Bearer token, verifies it with JWT_SECRET, and
// attaches the decoded payload to req.user. Used to protect the AI proxy (the paid
// API key behind it) and the project routes (student work) from anonymous traffic.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = { requireAuth };
