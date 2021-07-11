const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const dbConnection = require('./db-connection');
const router = express();
 
router.use(cookieParser());
router.use(express.json());

router.get('/', (req,res) => {
    res.send({ greeting:"welcome to waylab CTF" });
});

router.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

router.post('/signup', async (req, res) => {
    const { body } = req;
    try{
        const [data] = await dbConnection.execute("SELECT * FROM users where username = ?", [body.username]);
        if (data.length >= 1) {
            res.render('signup.ejs', {error: '사용자가 존재함.'});
        }
        
        const [data_] = await dbConnection.execute("INSERT INTO users (username, password, nickname, email) values (?, ?, ?, ?)", [body.username, body.password, body.nickname, body.email]);
        if (data_.affectedRows !== 1) {
            res.render('signup.ejs', {error: '가입 에러'});
        }
        res.render('login.ejs');
    }catch(e){
        console.log(e);
        res.send(e);
    }
});

module.exports = router;
