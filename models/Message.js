const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  ngl: {
    type: String,
    // gereken değerin string olduğunu belirtiyor
    required: true,
    // gereklilik
  },
  createdAt: { 
  //zaman kaydediliyor
    type: Date, 
    default: Date.now 
    
  }
});

module.exports = mongoose.model('Message', messageSchema);

