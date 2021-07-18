const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "config", process.env.NODE_ENV == "production" ? ".env" : ".env.dev")
});
const express = require("express");
const logger = require("morgan");
const cookieParser = require('cookie-parser');
const cors = require("cors");

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(cookieParser());
app.use(cors());

app.use('/api', require('./server/routes/index.js'));

app.use((req, res) => { res.redirect("http://waylab.kr") });

app.listen(3002, () => { console.log("Connected !") });

function err404(req, res) { res.sendFile('404.html', { root: path.join(__dirname, '/public/html/err') }); }