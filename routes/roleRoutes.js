const express = require("express");
const router = express.Router();
const Role = require("../models/Role");

// CREATE - Tạo role mới
router.post("/", async (req, res) => {
    try {
        const role = new Role(req.body);
        const savedRole = await role.save();
        res.status(201).json(savedRole);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// READ ALL - Lấy tất cả role (không bao gồm đã xoá mềm)
router.get("/", async (req, res) => {
    try {
        const roles = await Role.find({ isDeleted: false });
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ BY ID - Lấy role theo ID
router.get("/:id", async (req, res) => {
    try {
        const role = await Role.findOne({ _id: req.params.id, isDeleted: false });
        if (!role) {
            return res.status(404).json({ message: "Không tìm thấy role" });
        }
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE - Cập nhật role
router.put("/:id", async (req, res) => {
    try {
        const role = await Role.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true, runValidators: true }
        );
        if (!role) {
            return res.status(404).json({ message: "Không tìm thấy role" });
        }
        res.json(role);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE (Soft Delete) - Xoá mềm role
router.delete("/:id", async (req, res) => {
    try {
        const role = await Role.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!role) {
            return res.status(404).json({ message: "Không tìm thấy role" });
        }
        res.json({ message: "Đã xoá mềm role thành công", role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
