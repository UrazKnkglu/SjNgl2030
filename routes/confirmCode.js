const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

// Global Maps for registerCodes and twoFACodes
if (!global.registerCodes) global.registerCodes = new Map();
if (!global.twoFACodes) global.twoFACodes = new Map();

router.post('/confirm-code', async (req, res) => {
  const { token, code, trustDevice, deviceId } = req.body;
  if (!token || !code) return res.status(400).json({ error: 'missing_token_or_code' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);    
    
    // Check the purpose of the token
    if (
      decoded.purpose !== 'forgot' &&
      decoded.purpose !== 'register' &&
      decoded.purpose !== 'twofa_login'
    ) {
      return res.status(401).json({ error: 'invalid_token_purpose' });
    }

    // FORGOT PASSWORD flow
    if (decoded.purpose === 'forgot') {
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(404).json({ error: 'user_not_found' });

      if (
        !user.resetCode ||
        user.resetCode.code !== code ||
        new Date() > new Date(user.resetCode.expiresAt)
      ) {
        return res.status(401).json({ error: 'invalid_or_expired_code' });
      }

      user.resetCode = undefined;
      await user.save();
      global.tokenBlacklist.add(token);

      return res.json({ message: 'code_confirmed', purpose: 'forgot' });

    }

    // REGISTER flow
    if (decoded.purpose === 'register') {
      if (
        !global.registerCodes ||
        !global.registerCodes.has(token)
      ) {
        return res.status(401).json({ error: 'invalid_or_expired_code' });
      }

      const saved = global.registerCodes.get(token);

      if (saved.code !== code || Date.now() > saved.expiresAt) {
        return res.status(401).json({ error: 'invalid_or_expired_code' });
      }

      const { username, email, passwordHash } = decoded;

      let userExists = await User.findOne({ $or: [{ email }, { username }] });
      if (userExists) return res.status(409).json({ error: 'user_already_registered' });

      const newUser = new User({
        username,
        email,
        password: passwordHash
      });
      await newUser.save();

      global.registerCodes.delete(token);
      global.tokenBlacklist.add(token);

      return res.json({ message: 'code_confirmed', purpose: 'register' });

    }

    // TWO-FACTOR AUTHENTICATION (2FA) flow
    if (decoded.purpose === 'twofa_login') {
      
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(404).json({ error: 'user_not_found' });

      if (
        !global.twoFACodes ||
        !global.twoFACodes.has(token)
      ) {
        return res.status(401).json({ error: 'invalid_or_expired_code' });
      }

      const saved = global.twoFACodes.get(token);

      if (saved.code !== code || Date.now() > saved.expiresAt) {
        return res.status(401).json({ error: 'invalid_or_expired_code' });
      }

      // Remove the used 2FA code from global store
      global.twoFACodes.delete(token);
      global.tokenBlacklist.add(token);

      // ✅ If checkbox was selected, trust this device
      if (trustDevice && deviceId) {
        const alreadyTrusted = user.trustedDevices?.some(d => d.deviceId === deviceId);
        if (!alreadyTrusted) {
          user.trustedDevices = user.trustedDevices || [];
          user.trustedDevices.push({ deviceId, addedAt: new Date() });
          await user.save();
        }
      }

      // Create JWT token for the full login session now that 2FA is confirmed
      const fullToken = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: decoded.rememberMe ? "7d" : "1h" }
      );

      // Set cookie with full auth token
      res.cookie("token", fullToken, {
        httpOnly: true,
        sameSite: "Strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: decoded.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000
      });

      return res.json({ message: 'twofa_confirmed', purpose: 'twofa_login' });
    }

  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: 'invalid_token' });
  }
});

module.exports = router;
