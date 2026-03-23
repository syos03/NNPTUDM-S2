const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "246e36cba6445c",
        pass: "53c8a491e493b5",
    },
});

module.exports = {
    sendMail: async function (to, url) {
        const info = await transporter.sendMail({
            from: 'admin@heha.com',
            to: to,
            subject: "Reset Password email",
            text: "click vao day de reset password", // Plain-text version of the message
            html: "click vao <a href=" + url + ">day</a> de reset password", // HTML version of the message
        });
    },
    sendPasswordMail: async function (toEmail, username, password) {
        const path = require('path');
        try {
            const info = await transporter.sendMail({
                from: 'admin@heha.com',
                to: toEmail,
                subject: "Thông tin tạo tài khoản thành công",
                text: `Chào ${username}, Mật khẩu mặc định của bạn là: ${password}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>Xin chào, ${username}!</h2>
                        <p>Tài khoản của bạn trên hệ thống đã được tạo thành công.</p>
                        <p>Mật khẩu đăng nhập của bạn là: <strong style="color:red; font-size: 18px;">${password}</strong></p>
                        <br/>
                        <img src="cid:welcome_image" alt="Welcome to the system" style="max-width: 300px;"/>
                        <p>Vui lòng đăng nhập và đổi mật khẩu sớm nhất!</p>
                    </div>
                `,
                attachments: [
                    {
                        filename: 'welcome.png',
                        path: path.join(__dirname, 'assets', 'welcome.png'),
                        cid: 'welcome_image'
                    }
                ]
            });
            console.log("Đã gửi email mật khẩu đến " + toEmail);
        } catch (error) {
            console.error("Lỗi khi gửi email:", error);
        }
    }
}