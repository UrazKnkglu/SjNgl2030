const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        //mongoose'a bağlanıyor, bağlanamazsa error yakalayıp mesaj yazıyor
        console.log("MongoDB connected.");
    } catch (err) {     
        console.error("MongoDB connection failed:", err.message);         
    }
};

module.exports = connectDB;