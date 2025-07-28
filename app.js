const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api", require("./routes/auth"));

if (!global.tokenBlacklist) global.tokenBlacklist = new Set();

app.listen(1001, "0.0.0.0", () => {
    console.log("Server is running at http://192.168.1.5:1001");
});
