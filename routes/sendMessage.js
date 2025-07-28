const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.patch('/sendMessage', async (req, res) => {
  try {
    const { ngl } = req.body;

    if (!ngl || ngl.trim() === "") {
      return res.status(400).json({ error: "ngl value is required" });
    }

    const newMessage = new Message({ ngl });
    await newMessage.save();

    res.json({ success: true, message: "Message saved successfully!" });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/messages', async (req, res) => {
    try {
      const messages = await Message.find().sort({ createdAt: -1 }); // en yeniler en üstte
      res.json(messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  router.get('/messages/:id', async (req, res) => {
    try {
      const message = await Message.findById(req.params.id);
      if (!message) {
        return res.status(404).json({ error: "Mesaj bulunamadı" });
      }
      res.json(message);
    } catch (err) {
      console.error("Mesaj getirme hatası:", err);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  });
  
  router.delete('/messages/:id', async (req, res) => {
    try {
      const deletedMessage = await Message.findByIdAndDelete(req.params.id);
      if (!deletedMessage) {
        return res.status(404).json({ error: "Mesaj bulunamadı" });
      }
      res.json({ success: true, message: "Mesaj silindi" });
    } catch (err) {
      console.error("Mesaj silme hatası:", err);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  });

router.post("/uploadStoryImage", async (req, res) => {
    try {
      const base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
      const fileName = `${Date.now()}.png`;
      const filePath = path.join(__dirname, "../public/stories", fileName);
  
      fs.writeFileSync(filePath, base64Data, "base64");
  
      // Kullanıcıya public URL dön
      res.json({ url: `/stories/${fileName}` });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Upload failed" });
    }
  });
  
  
module.exports = router;
