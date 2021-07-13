const express = require('express');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const { uuid } = require('uuidv4');
const { MailSend } = require('./Email-Send.js');
const dbConnection = require('./db-connection');
const router = express();
const SECRET = 'test'; // 임시

router.get('/', (req,res) => {
    res.render('index.ejs', {message: "Beta Test" });
});

router.get('/login', (req, res) => {
    res.render('login.ejs');
})

router.post('/login', async (req, res) => {
    const { body } = req;
    try {
        const hash_pass = crypto.createHash("sha256").update(body.password, "binary").digest("hex");
        const [data] = await dbConnection.execute("SELECT * FROM users where username = ? and password = ?", [body.username, hash_pass]);
        if (data.length < 1) {
            res.render('login.ejs', {error: '가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.'});
        } else {
            if (data[0]['email_verify'] == 1){
                const token = await jwt.sign({ user: data[0]['username'], verify: data[0]['email_verify']}, SECRET, { expiresIn: '1h'});
                res.cookie('token', token);
                res.redirect("/");       
            } else { res.status(400); res.send("Please verify your email")}
        }
    }catch (error) {
        console.log(error);
        res.status(500);
        res.send('500 Server Error');
    }
});

router.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

router.post('/signup', async (req, res) => {
    const { body } = req;
    try{
        const [data] = await dbConnection.execute("SELECT * FROM users where username = ? or email = ?", [body.username, body.email]);
        if (data.length >= 1) {
            res.render('signup.ejs', {error: '사용자 또는 이메일 중복'});
        } else{       
            const hash_pass = crypto.createHash("sha256").update(body.password, "binary").digest("hex");
            const token = uuid();
            const url = `http://141.164.47.126:3002/confirm/${token}`;
            const [data_] = await dbConnection.execute("INSERT INTO users (username, password, nickname, email, email_verify, token) values (?, ?, ?, ?, ?, ?)", 
                [body.username, hash_pass, body.nickname, body.email, false, token]
            );
            if (data_.affectedRows !== 1) {
                res.render('signup.ejs', {error: '가입 실패'});
            } else{ 
                MailSend(body.email, url);
                res.send("Verification email sent!");
            }
        }
    }catch (error){
        console.log(error);
        res.status(500);
        res.send('500 Server Error');
    }
});

router.get('/confirm/:token', async (req, res) => {
    const token = req.params.token;
    try{
        const [data] = await dbConnection.execute("SELECT * FROM users where token = ?", [token]);
        if (data.length >= 1) {
            const [verify] = await dbConnection.execute("UPDATE users SET email_verify = 1, token = '' WHERE token = ?",[token]);
            if (verify.info.indexOf("Changed: 1") != -1){
                res.redirect('/login');
            }
        } else {
            res.status(400);
            res.send("bad token");
        }
    } catch (err) {
        res.status(500);
        res.send('500 Sever Error');
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

module.exports = router;