const express = require('express');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const { uuid } = require('uuidv4');
const { MailSend } = require('./Email-Send.js');
const dbConnection = require('./db-connection');

const router = express();
const SECRET = 'test'; // 임시
const eamil_regex  = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@dimigo.hs.kr$/i;  

router.get('/', (req,res) => {
    res.render('index.ejs', {message: "Beta Test" });
});

// 로그인 페이지.
router.get('/login', (req, res) => {
    res.render('login.ejs');
})

// 로그인 api 기능
router.post('/login', async (req, res) => {
    const { body } = req;
    try {
        const hash_pass = crypto.createHash("sha256").update(body.password, "binary").digest("hex");
        const [data] = await dbConnection.execute("SELECT * FROM users where username = ? and password = ?", [body.username, hash_pass]);
        if (data.length < 1) { // 사용자 계정 존재 여부 검증.
            res.render('Not registered account or wrong password');
        } else {
            if (data[0]['email_verify'] == 1){ // 사용자 계정 인증 검증.
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

// 회원 가입 페이지.
router.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

// 회원가입 api 기능
router.post('/signup', async (req, res) => {
    const { body } = req;
    try{
        const [data] = await dbConnection.execute("SELECT * FROM users where username = ? or email = ? or nickname = ?", [body.username, body.email, body.nickname]);
        if (data.length >= 1) { // 아이디와 이메일 중복 여부 검증
            // res.send("username or email or nickname exist!");
            if(body.username == data.username) { return res.send("username"); }
            else if(body.nickname == data.nickname) { return res.send("nickname"); }
            else if(body.email == data.email) { return res.send("email"); }
        } else{     
            const hash_pass = crypto.createHash("sha256").update(body.password, "binary").digest("hex");
            if(!eamil_regex.test(body.email)) {
                res.send('Only use a dimigo email.');
            }
            else{
                const token = uuid();
                const url = `http://141.164.47.126:3002/confirm/${token}`;
                const [data_] = await dbConnection.execute("INSERT INTO users (username, password, nickname, email, email_verify, token, solved, pts) values (?, ?, ?, ?, ?, ?, '', 0)", 
                    [body.username, hash_pass, body.nickname, body.email, false, token]
                );
                if (data_.affectedRows !== 1) {
                    res.render('signup.ejs', {error: 'Register Failed'});
                } else{ 
                    MailSend(body.email, url);
                    res.send("Verification email sent!");
                }
            }
        }
    }catch (error){
        console.log(error);
        res.status(500);
        res.send('500 Server Error');
    }
});

// 이메일 인증 api 기능
router.get('/confirm/:token', async (req, res) => {
    const token = req.params.token;
    try{
        const [data] = await dbConnection.execute("SELECT * FROM users where token = ?", [token]);
        if (data.length >= 1) { // token을 가진 사용자 존재 여부 검증
            const [verify] = await dbConnection.execute("UPDATE users SET email_verify = 1, token = '' WHERE token = ?",[token]);
            if (verify.info.indexOf("Changed: 1") != -1){ // 계정 활성화가 잘 되었는 지 검증.
                res.send('Auth Success');
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

router.get('/test', (req, res) => {
    res.send('proxy test');
});


module.exports = router;