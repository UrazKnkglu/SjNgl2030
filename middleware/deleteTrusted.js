// routes/middleware.js (or wherever you want)
// Make sure this file is required in your main app with app.use('/middleware', middlewareRouter)

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/deleteTrusted', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'user_not_found' });

    try {

        const { deviceId } = req.body;

        if (!Array.isArray(user.trustedDevices)) user.trustedDevices = [];
        user.trustedDevices = user.trustedDevices.filter(d => d.deviceId !== deviceId);

    } catch (err) {

        user.trustedDevices = [];
        
    }

    await user.save();

    res.json({ message: 'trusted_device_removed' });

  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'invalid_token' });
  }
});

module.exports = router;
