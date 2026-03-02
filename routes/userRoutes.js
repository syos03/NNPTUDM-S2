const express = require("express");
const router = express.Router();
const User = require("../models/User");

// CREATE - Tạo user mới
router.post("/", async (req, res) => {
    try {
        const user = new User(req.body);
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// READ ALL - Lấy tất cả user (không bao gồm đã xoá mềm), populate role
router.get("/", async (req, res) => {
    try {
        const users = await User.find({ isDeleted: false }).populate("role");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ BY ID - Lấy user theo ID, populate role
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            isDeleted: false,
        }).populate("role");
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE - Cập nhật user
router.put("/:id", async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        ).populate("role");
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE (Soft Delete) - Xoá mềm user
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }
        res.json({ message: "Đã xoá mềm user thành công", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /enable - Kích hoạt user (status = true)
router.post("/enable", async (req, res) => {
    try {
        const { email, username } = req.body;

        if (!email || !username) {
            return res
                .status(400)
                .json({ message: "Cần cung cấp email và username" });
        }

        const user = await User.findOne({
            email,
            username,
            isDeleted: false,
        });

        if (!user) {
            return res
                .status(404)
                .json({ message: "Thông tin email hoặc username không đúng" });
        }

        user.status = true;
        await user.save();

        res.json({ message: "Đã kích hoạt user thành công", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /disable - Vô hiệu hoá user (status = false)
router.post("/disable", async (req, res) => {
    try {
        const { email, username } = req.body;

        if (!email || !username) {
            return res
                .status(400)
                .json({ message: "Cần cung cấp email và username" });
        }

        const user = await User.findOne({
            email,
            username,
            isDeleted: false,
        });

        if (!user) {
            return res
                .status(404)
                .json({ message: "Thông tin email hoặc username không đúng" });
        }

        user.status = false;
        await user.save();

        res.json({ message: "Đã vô hiệu hoá user thành công", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
