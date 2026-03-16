var express = require("express");
var router = express.Router();
let { checkLogin } = require('../utils/authHandler')
let reservationModel = require('../schemas/reservations')
let cartModel = require('../schemas/carts')
let inventoryModel = require('../schemas/inventories')
let productModel = require('../schemas/products')
let mongoose = require('mongoose')

// GET all cua user -> get reservations/
router.get('/', checkLogin, async function (req, res, next) {
    try {
        let reservations = await reservationModel.find({
            user: req.userId
        }).populate('items.product');
        res.send(reservations);
    } catch (error) {
        next(error);
    }
});

// get 1 cua user -> get reservations/:id
router.get('/:id', checkLogin, async function (req, res, next) {
    try {
        let reservation = await reservationModel.findOne({
            _id: req.params.id,
            user: req.userId
        }).populate('items.product');
        if (!reservation) {
            return res.status(404).send({ message: "Không tìm thấy đơn đặt hàng" });
        }
        res.send(reservation);
    } catch (error) {
        next(error);
    }
});

// reserveACart -> post reserveACart/
router.post('/reserveACart', checkLogin, async function (req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let currentCart = await cartModel.findOne({ user: req.userId }).session(session);
        if (!currentCart || currentCart.cartItems.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({ message: "Giỏ hàng trống" });
        }

        let reservationItems = [];
        let totalAmount = 0;

        for (let item of currentCart.cartItems) {
            let product = await productModel.findById(item.product).session(session);
            let inventory = await inventoryModel.findOne({ product: item.product }).session(session);

            if (!inventory || inventory.stock < item.quantity) {
                throw new Error(`Sản phẩm ${product.title} không đủ hàng trong kho`);
            }

            // Cập nhật kho
            inventory.stock -= item.quantity;
            inventory.reserved += item.quantity;
            await inventory.save();

            let subtotal = product.price * item.quantity;
            reservationItems.push({
                product: item.product,
                quantity: item.quantity,
                title: product.title,
                price: product.price,
                subtotal: subtotal
            });
            totalAmount += subtotal;
        }

        let expiredIn = new Date();
        expiredIn.setHours(expiredIn.getHours() + 24);

        let newReservation = new reservationModel({
            user: req.userId,
            items: reservationItems,
            amount: totalAmount,
            expiredIn: expiredIn
        });

        await newReservation.save({ session });

        // Xóa giỏ hàng
        currentCart.cartItems = [];
        await currentCart.save({ session });

        await session.commitTransaction();
        session.endSession();
        res.status(201).send(newReservation);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
});

// reserveItems -> post reserveItems/ {body gom list product va quantity}
router.post('/reserveItems', checkLogin, async function (req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let { items } = req.body; // Expecting [{ product, quantity }]
        if (!items || items.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).send({ message: "Danh sách sản phẩm trống" });
        }

        let reservationItems = [];
        let totalAmount = 0;

        for (let item of items) {
            let product = await productModel.findById(item.product).session(session);
            let inventory = await inventoryModel.findOne({ product: item.product }).session(session);

            if (!inventory || inventory.stock < item.quantity) {
                throw new Error(`Sản phẩm ${product ? product.title : item.product} không đủ hàng trong kho`);
            }

            inventory.stock -= item.quantity;
            inventory.reserved += item.quantity;
            await inventory.save();

            let subtotal = product.price * item.quantity;
            reservationItems.push({
                product: item.product,
                quantity: item.quantity,
                title: product.title,
                price: product.price,
                subtotal: subtotal
            });
            totalAmount += subtotal;
        }

        let expiredIn = new Date();
        expiredIn.setHours(expiredIn.getHours() + 24);

        let newReservation = new reservationModel({
            user: req.userId,
            items: reservationItems,
            amount: totalAmount,
            expiredIn: expiredIn
        });

        await newReservation.save({ session });

        await session.commitTransaction();
        session.endSession();
        res.status(201).send(newReservation);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
});

// cancelReserve -> post cancelReserve/:id
router.post('/cancelReserve/:id', checkLogin, async function (req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        let reservation = await reservationModel.findOne({
            _id: req.params.id,
            user: req.userId,
            status: "actived"
        }).session(session);

        if (!reservation) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).send({ message: "Không tìm thấy reservation đang hoạt động" });
        }

        for (let item of reservation.items) {
            let inventory = await inventoryModel.findOne({ product: item.product }).session(session);
            if (inventory) {
                inventory.stock += item.quantity;
                inventory.reserved -= item.quantity;
                await inventory.save();
            }
        }

        reservation.status = "cancelled";
        await reservation.save({ session });

        await session.commitTransaction();
        session.endSession();
        res.send({ message: "Đã hủy đơn đặt hàng công", reservation });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
});

module.exports = router;
