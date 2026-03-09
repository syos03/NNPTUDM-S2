var express = require('express');
var router = express.Router();
let productModel = require('../schemas/products')
let { ConvertTitleToSlug } = require('../utils/titleHandler')
let { getMaxID } = require('../utils/IdHandler')
let { checkLogin, checkRole } = require('../utils/authHandler')

// GET all – public (tất cả user, không cần đăng nhập)
router.get('/', async function (req, res, next) {
  let products = await productModel.find({});
  res.send(products)
});

// GET by ID – public (tất cả user, không cần đăng nhập)
router.get('/:id', async function (req, res, next) {
  try {
    let result = await productModel.find({ _id: req.params.id });
    if (result.length > 0) {
      res.send(result)
    } else {
      res.status(404).send({
        message: "id not found"
      })
    }
  } catch (error) {
    res.status(404).send({
      message: "id not found"
    })
  }
});

// POST tạo product – ADMIN & MODERATOR
router.post('/', checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
  let newItem = new productModel({
    title: req.body.title,
    slug: ConvertTitleToSlug(req.body.title),
    price: req.body.price,
    description: req.body.description,
    category: req.body.category
  })
  await newItem.save()
  res.send(newItem);
})

// PUT cập nhật product – ADMIN & MODERATOR
router.put('/:id', checkLogin, checkRole("ADMIN", "MODERATOR"), async function (req, res, next) {
  let id = req.params.id;
  let updatedItem = await productModel.findByIdAndUpdate(
    id, req.body, {
    new: true
  }
  )
  if (!updatedItem) return res.status(404).send({ message: "id not found" });
  res.send(updatedItem)
})

// DELETE xoá product – chỉ ADMIN
router.delete('/:id', checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  let id = req.params.id;
  let updatedItem = await productModel.findByIdAndUpdate(
    id, {
    isDeleted: true
  }, {
    new: true
  }
  )
  if (!updatedItem) return res.status(404).send({ message: "id not found" });
  res.send(updatedItem)
})

module.exports = router;
