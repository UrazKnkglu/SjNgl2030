// routes/twofa.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Token doğrulama middleware'i
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'invalid_token' });
  }
}

router.patch('/twofa', authenticateToken, async (req, res) => {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'invalid_request' });
    }
  
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'user_not_found' });
      }
  
      user.twoFA.enabled = enabled;
      await user.save();
  
      res.json({ message: 'twoFA_updated', twoFA: user.twoFA });
    } catch (err) {
      console.error("TwoFA update error:", err);
      res.status(500).json({ error: 'server_error' });
    }
  });
  
  
module.exports = router;
