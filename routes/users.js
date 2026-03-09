var express = require("express");
var router = express.Router();
let bcrypt = require('bcrypt')
let { userPostValidation, validateResult } =
  require('../utils/validationHandler')
let { checkLogin, checkRole } = require('../utils/authHandler')

let userController = require("../controllers/users");


// GET all users – chỉ ADMIN
router.get("/", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  let result = await userController.getAllUser();
  res.send(result)
});

// GET user by ID – ADMIN & MODERATOR
router.get("/:id", checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
  try {
    let result = await userController.FindByID(req.params.id)
    if (result) {
      res.send(result);
    }
    else {
      res.status(404).send({ message: "id not found" });
    }
  } catch (error) {
    res.status(404).send({ message: "id not found" });
  }
});

// POST tạo user mới – chỉ ADMIN
router.post("/", checkLogin, checkRole("ADMIN"), userPostValidation, validateResult,
  async function (req, res, next) {
    try {
      let newItem = await userController.CreateAnUser(
        req.body.username,
        req.body.password,
        req.body.email,
        req.body.role,
        "", "",
        false
      )
      // populate cho đẹp
      let saved = await userController.FindByID(newItem._id);
      res.send(saved);
    } catch (err) {
      res.status(400).send({ message: err.message });
    }
  });

// PUT cập nhật user – chỉ ADMIN
router.put("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userController.UpdateUser(id, req.body);
    if (!updatedItem) return res.status(404).send({ message: "id not found" });
    let populated = await userController.FindByID(updatedItem._id);
    res.send(populated);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// DELETE xoá mềm user – chỉ ADMIN
router.delete("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userController.DeleteUser(id);
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;