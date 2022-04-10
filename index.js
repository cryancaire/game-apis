require('dotenv').config()
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const passport = require('passport');
const port = process.env.PORT;

app.use(passport.initialize());
app.use(passport.session());


app.set('view engine', 'ejs');
app.use('/diablo', require('./diablo3'));
app.use('/ff14', require('./ff14'));
app.use("/public", express.static('public'))

app.get('/', (req, res) => {
    res.render('pages/mainpage');
});

http.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});