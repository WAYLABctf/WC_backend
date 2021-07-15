const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "waylabctf@gmail.com",
        pass: "W4YL4Bc7f"
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports={
    smtpTransport
}
