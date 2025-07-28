const express = require('express');
const User = require('../models/User');
const checkAuth = require('../middleware/checkAuth');
const router = express.Router();

router.get('/profile', checkAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'user_not_found' });

        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: 'server_error' });
    }
});

module.exports = router;
