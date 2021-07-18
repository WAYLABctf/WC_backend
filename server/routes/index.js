const express = require('express');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const { uuid } = require('uuidv4');
const { MailSend } = require('./Email-Send.js');
const dbConnection = require('./db-connection');

const router = express();
const SECRET = process.env.JWT_KEY;
const email_regex  = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@dimigo.hs.kr$/i;  // 디미고 이메일 정규식

router
.get('/', (req,res) => {
    res.render('index.ejs', {message: "Beta Test" });
})

// 로그인 페이지.
.get('/login', (req, res) => {
    res.render('login.ejs');
})

// 로그인 api 기능
.post('/login', async (req, res) => {
    const { body } = req;
    try {
        const hash_pass = crypto.createHash("sha256").update(body.password, "binary").digest("hex");
        const [data] = await dbConnection.execute("SELECT * FROM users where username = ? and password = ?", [body.username, hash_pass]);
        if (data.length < 1) { // 사용자 계정 존재 여부 검증.
            [data_] = await dbConnection.execute("SELECT * FROM users WHERE username=?", [body.username]);
            if(data_.length < 1) { res.send('not_registered'); }
            else { res.send('wrong_password'); }
        } else {
            if (data[0]['email_verify'] == 1){ // 사용자 계정 인증 검증.
                const token = await jwt.sign({ user: data[0]['username'], verify: data[0]['email_verify']}, SECRET, { expiresIn: '1h'});
                res.cookie('token', token);
                res.send("success"); 
            } else { res.send("Please verify your email..")}
        }
    }catch (error) {
        console.log(error);
        res.status(500);
        res.send('500 Server Error');
    }
})

// 로그인 검증
.get('/isLogin', async (req,res) =>{
    try{
        let token = req.cookies['token'];
        if(token !== undefined) {
            await jwt.verify(token, SECRET, (err, decoded) => {
                if(err) {
                    res.status(500);
                    res.send("500 Server Error");
                } else {
                    res.status(200);
                    res.send("Logined");
                }
            });
        } else {
            res.status(400);
            res.send("no Login");
        }
    } catch (err) {
        res.status(500).send("500 Server Error");
    }
})

// 회원 가입 페이지.
.get('/signup', (req, res) => {
    res.render('signup.ejs');
})

// 회원가입 api 기능
.post('/signup', async (req, res) => {
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
            // !email_regex.test(body.email)
            if(!email_regex.test(body.email)) { res.send('Only use a dimigo email.'); }
            else {
                const token = uuid();
                const url = `http://141.164.47.126:3002/api/confirm/${token}`;
                const solved = JSON.stringify({solved:[]})
                const [data_] = await dbConnection.execute("INSERT INTO users (username, password, nickname, email, email_verify, token, solved, pts) values (?, ?, ?, ?, ?, ?, ?, 0)", 
                    [body.username, hash_pass, body.nickname, body.email, false, token, solved]
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
})

// 이메일 인증 api 기능
.get('/confirm/:token', async (req, res) => {
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
})

.get('/logout', (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
})

.post('/auth-flag', async (req, res) => {
    const { body } = req;
    try{
        if(req.cookies['token'] !== undefined){
            token = req.cookies['token'];
            design = jwt.verify(token, SECRET);
            //console.log(design.user)
            const [challenge] = await dbConnection.execute("SELECT * FROM challenges where flag = ?", [body.flag]);
            const [user] = await dbConnection.execute("SELECT * FROM users where username = ?", [design.user]);
            if (challenge.length > 0) {
                J_solved = JSON.parse(user[0].solved)
                //console.log(typeof challenge[0].id)
                if (J_solved.solved.length == 0) {
                    check = true;
                } else {
                    for (let i = 0; i < J_solved.solved.length; i++) {
                        //console.log(typeof J_solved.solved[i]);
                        if (J_solved.solved[i] == challenge[0].id) {
                            check = false;
                        } else {
                            check = true;
                        }
                    }
                }
                if (check){
                    pts = user[0].pts + challenge[0].pts; // 사용자 점수 + 문제 점수
                    J_solved.solved.push(challenge[0].id); // 사용자가 푼 문제 + 현재 푼 문제
                    const [auth_flag_users] = await dbConnection.execute("UPDATE users SET pts = ?, solved = ? , auth_time = NOW() WHERE username = ?", [pts, , JSON.stringify(J_solved), user[0].username]); // 사용자가 문제를 풀었을 때, 점수와 사용자가 해결한 문제를 업데이터 함.
                
                    J_solver = JSON.parse(challenge[0].solver) 
                    J_solver.solver.push(user[0].id) // 문제를 해결한 모든 사용자 정리
                    const [auth_flag_challenges] = await dbConnection.execute("UPDATE challenges SET solver = ? WHERE probname = ?", [JSON.stringify(J_solver), challenge[0].probname]);
                    //console.log(auth_flag_users);
                    //console.log(auth_flag_challenges);
                    if (auth_flag_users.info.indexOf("Changed: 1") != -1 && auth_flag_challenges.info.indexOf("Changed: 1") != -1) {
                        res.send("Correct Flag")
                    }
                } else { res.send('already solved'); }
            } else { res.send('Wrong flag'); }
        } else { res.send('Not Login'); }
    } catch (err) {
        console.log(err);
        res.status(500);
        res.send('500 Sever Error');
    }
})

.get('/get-info', async (req, res) => {
    try {
        if(req.cookies['token'] !== undefined) {
            let token = req.cookies['token'];
            let design = jwt.verify(token, SECRET);
            // const [user] = await dbConnection.execute("SELECT * FROM users where username = ?", [design.user]);
            
            let rank;
            const [user] = await dbConnection.execute("SELECT username, email, nickname, pts FROM users WHERE email_verify=1 ORDER BY `pts` DESC LIMIT 1000;");
            for (let i = 0; i < user.length; i++)
            if(user[i].username == design.user) { rank = i+1; break; }

            res.status(200).json({
                email: user[0].email,
                nickname: user[0].nickname,
                score: user[0].pts,
                rank });
        } else {
            res.status(400);
            res.send("no Login");
        }
    } catch (err) {
        console.log(err);
        res.status(500);
        res.send('500 Server Error');
    }
})

.get('/scoreboard', async (req, res) => {
    try {
        const [result] = await dbConnection.execute("SELECT nickname, pts, auth_time FROM users WHERE email_verify=1 ORDER BY `pts` DESC LIMIT 1000;");
        for (let i = 0; i < result.length; i++) result[i].rank = i + 1;
        for (let i = 0; i < result.length; i++) {if (result[i].pts == 0) {result.splice(i, 1);}}
        res.send(result);
    } catch (err) {
        console.log(err);
        res.status(500);
        res.send('500 Server Error');
    }
});

module.exports = router;