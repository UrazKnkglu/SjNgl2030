const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });



const JWT_SECRET = process.env.JWT_SECRET;

function generateSixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'missing_fields' });
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(409).json({ error: 'email_already_registered' });

        const usernameExists = await User.findOne({ username });
        if (usernameExists) return res.status(409).json({ error: 'username_already_registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ message: 'user_created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server_error' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { username, password, deviceId, rememberMe } = req.body;

  if (!username || !password) {
      return res.status(400).json({ error: 'missing_fields' });
  }

  const user = await User.findOne({
      $or: [{ email: username }, { username: username }]
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'invalid_credentials' });
  }

  const trustedDevice = user.trustedDevices?.find(d => d.deviceId === deviceId);

if (trustedDevice) {

  // JWT oluştur ve çereze yaz
  const fullToken = jwt.sign(
    { userId: user._id },
    JWT_SECRET,
    { expiresIn: rememberMe ? '7d' : '1h' }
  );

  res.cookie("token", fullToken, {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000
  });

  return res.json({ message: 'login_success', trusted: true });
}




  // Eğer 2FA aktifse, token göndermiyoruz!
  if (user.twoFA.enabled) {
    const tempToken = jwt.sign(
      { userId: user._id, purpose: "twofa_login", rememberMe }, 
      JWT_SECRET, 
      { expiresIn: "10m" }
    );
  
    // 6 haneli doğrulama kodu oluştur
    

    const al = new Date(Date.now() + 10 * 60 * 1000)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.twoFA.code = code;
    user.twoFA.expiresAt = al; // 10dk
    await user.save();
    
    global.twoFACodes.set(tempToken, { code, al });
    
    // Mail gönder
    const link = `http://${req.headers.host}/confirm?token=${tempToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Your 2FA Code is: ${code}`,
      text: `Your 2FA Code: ${code} \n\n If Confirm Page Didn't Show Up:\n${link}`
    });
  
    return res.status(200).json({
      message: 'twofa_required',
      twofa: true,
      token: tempToken
    });
  }
  

  // 2FA yoksa klasik token ver
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: rememberMe ? "7d" : "1h"
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000
  });

  res.json({ message: 'login_success' });
});

// LOGOUT
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'logout_success' });
});

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'missing_email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'user_not_found' });

    const code = generateSixDigitCode();

    const token = jwt.sign(
      { userId: user._id, purpose: "forgot" },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    user.resetCode = {
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };
    await user.save();

    const link = `https://sjngl2030.onrender.com/confirm?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Your Reset Password Code is: ${code}`,
      text: `Your Reset Password Code: ${code} \n\n If Confirm Page Didn't Show Up:\n${link}`
    };

    await transporter.sendMail(mailOptions);

    

    res.json({ message: 'reset_link_sent', confirmLink: link });
});

router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'missing_token_or_password' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.purpose !== 'forgot') {
            return res.status(401).json({ error: 'invalid_token_purpose' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ error: 'user_not_found' });

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // resetCode ve diğer reset verilerini temizle
        user.resetCode = undefined;
        await user.save();

        res.json({ message: 'password_reset_success' });
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'invalid_or_expired_token' });
    }
});

router.post('/send-register-code', async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'missing_fields' });
      }
  
      // Kullanıcı var mı kontrol et
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(409).json({ error: 'email_already_registered' });
  
      const usernameExists = await User.findOne({ username });
      if (usernameExists) return res.status(409).json({ error: 'username_already_registered' });
  
      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // 6 haneli kod üret
      const code = generateSixDigitCode();
  
      // Token oluştur, içinde kullanıcı bilgileri ve amaç: register var
      const token = jwt.sign(
        {
          username,
          email,
          passwordHash: hashedPassword,
          purpose: 'register'
        },
        JWT_SECRET,
        { expiresIn: '10m' }
      );
  
      // Mail ayarları
      const link = `http://${req.headers.host}/confirm?token=${token}`;
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Your Registiration Code is: ${code}`,
        text: `Your Registiration Code: ${code} \n\n If Confirm Page Didn't Show Up:\n${link}`
      };
  
      // Mail gönder
      await transporter.sendMail(mailOptions);
  
  
      if (!global.registerCodes) global.registerCodes = new Map();
      global.registerCodes.set(token, {
        code,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 dakika geçerli
      });
  
      res.json({ message: 'verification_email_sent', confirmLink: link });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'server_error' });
    }
  });

  router.post('/decode-token', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'missing_token' });
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET); // doğrulama dahil
      res.json({ purpose: decoded.purpose });
    } catch (err) {
      res.status(401).json({ error: 'invalid_token' });
    }
  });
  
  
  

module.exports = router;
