const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
    service: "Naver",
    auth: {
        user: "whwjddnjs1202@naver.com",
        pass: "qwer122121@"
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports={
    smtpTransport
}
