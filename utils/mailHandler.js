const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 25,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "afb860a426d68e",
        pass: "d3964b7baf52ff",
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
    sendPasswordMail: async function (to, password) {
        const info = await transporter.sendMail({
            from: 'admin@heha.com',
            to: to,
            subject: "Your New Account Information",
            text: `Welcome! Your account has been created. Your password is: ${password}`,
            html: `<p>Welcome! Your account has been created.</p><p>Your password is: <strong>${password}</strong></p>`,
        });
    }
}