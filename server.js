const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const confirmCodeRouter = require('./routes/confirmCode');
const twofaRouter = require('./routes/twofa');
const middlewareRouter = require('./middleware/deleteTrusted');
const sendMessageRouter = require('./routes/sendMessage');


const app = express();
const PORT = 1001;

mongoose.connect(process.env.MONGO_URI, {
});



app.use(express.json({limit: "10mb"}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', authRouter);
app.use('/api', profileRouter);
app.use('/api', confirmCodeRouter);
app.use('/api', twofaRouter);
app.use('/api', sendMessageRouter);

app.use('/middleware', middlewareRouter);
app.use('/scripts', express.static(path.join(__dirname, '/scripts')));

app.get('/:page', (req, res, next) => {
    const filePath = path.join(__dirname, 'public', `${req.params.page}.html`);
    res.sendFile(filePath, err => {
      if (err) next(); // if file not found, let other routes handle it
    });
  });  
  
app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://192.168.1.5:${PORT}`);
});
