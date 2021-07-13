const { smtpTransport } = require('./email');

const MailSend = function(mail, url){ 
    emailTemplete = `<html>
<body>
  <div>
    <p style='color:black'>회원 가입을 위한 인증번호 입니다.</p>
    <p style='color:black'>아래의 인증 번호를 입력하여 인증을 완료해주세요.</p>
    <h2>${url}</h2>
  </div>
</body>
</html>
    `;
    const mailOptions = {
        from: "whwjddnjs1202@naver.com",
        to: mail,
        subject: "[WAYLABctf]인증 관련 이메일 입니다",
        html: emailTemplete
    };

    smtpTransport.sendMail(mailOptions, (error) =>{ 
        if(error){
            console.log(error);
        }
        smtpTransport.close();
    });
};

// MailSend('whwjddnjs14@gmail.com', 'http://localhost:3000/confirm/0aaa0317-97e7-4e0b-8ebd-203e54069129');

module.exports={
    MailSend
}
