// models/User.js
const mongoose = require('mongoose');
// mongoose bağlantısı

const trustedDeviceSchema = new mongoose.Schema({
  deviceId: String,
  addedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  twoFA: {
    code: String,
    expiresAt: Date,
    enabled: { type: Boolean, default: false }
  },
  resetCode: {
      code: String,
      expiresAt: Date
  },
  trustedDevices: [trustedDeviceSchema]
});


module.exports = mongoose.model('User', userSchema);
