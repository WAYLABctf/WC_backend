const express = require('express');
const jwt = require('jsonwebtoken');
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
        const [data] = await dbConnection.execute("SELECT * FROM users where username = ? and password = ?", [body.username, body.password]);
        if (data.length < 1) {
            res.render('login.ejs', {error: '가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.'});
        } else {
            const token = await jwt.sign({ user: data.username}, SECRET, { expiresIn: '1h'});
            res.cookie('token', token);
            res.redirect("/");           
        }
    }catch{
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
        const [data] = await dbConnection.execute("SELECT * FROM users where username = ?", [body.username]);
        if (data.length >= 1) {
            res.render('signup.ejs', {error: '사용자가 존재함.'});
        } else{       
            const [data_] = await dbConnection.execute("INSERT INTO users (username, password, nickname, email) values (?, ?, ?, ?)", [body.username, body.password, body.nickname, body.email]);
            if (data_.affectedRows !== 1) {
                res.render('signup.ejs', {error: '가입 실패'});
            } else{ res.redirect("/login"); }
        }
    }catch{
        res.status(500);
        res.send('500 Server Error');
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

module.exports = router;
