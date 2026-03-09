var express = require('express');
var router = express.Router();
let userController = require('../controllers/users')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
let { checkLogin } = require('../utils/authHandler')


// POST /auth/register
router.post('/register', async function (req, res, next) {
  let newUser = await userController.CreateAnUser(
    req.body.username,
    req.body.password,
    req.body.email,
    '69a4f929f8d941f2dd234b88'
  )
  res.send(newUser)
});

// POST /auth/login
router.post('/login', async function (req, res, next) {
  let { username, password } = req.body;
  let getUser = await userController.FindByUsername(username);
  if (!getUser) {
    res.status(404).send({
      message: "username khong ton tai hoac thong tin dang nhap sai"
    })
    return;
  }
  let result = bcrypt.compareSync(password, getUser.password);
  if (result) {
    let token = jwt.sign({
      id: getUser._id,
      exp: Date.now() + 3600 * 1000
    }, "HUTECH")
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000
    });
    res.send(token)
  } else {
    res.status(404).send({
      message: "username khong ton tai hoac thong tin dang nhap sai"
    })
  }
});

// GET /auth/me – lấy thông tin user đang đăng nhập
router.get('/me', checkLogin, async function (req, res, next) {
  let user = await userController.FindByID(req.userId);
  res.send(user)
});

// POST /auth/logout
router.post('/logout', checkLogin, function (req, res, next) {
  res.cookie('token', null, {
    maxAge: 0,
    httpOnly: true
  })
  res.send("logout")
})

// POST /auth/change-password – đổi mật khẩu (yêu cầu đăng nhập)
router.post('/change-password', checkLogin, async function (req, res, next) {
  try {
    let { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).send({ message: "Vui long cung cap oldPassword va newPassword" });
    }

    // Lấy user kèm password (FindByID dùng populate nên không lấy password – query thẳng)
    let userModel = require('../schemas/users');
    let user = await userModel.findOne({ _id: req.userId, isDeleted: false });
    if (!user) {
      return res.status(404).send({ message: "Nguoi dung khong ton tai" });
    }

    // Kiểm tra mật khẩu cũ
    let isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Mat khau cu khong chinh xac" });
    }

    // Đổi mật khẩu mới
    await userController.changePassword(req.userId, newPassword);
    res.send({ message: "Doi mat khau thanh cong" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});


module.exports = router;
