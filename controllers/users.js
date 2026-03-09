var express = require("express");
let userModel = require("../schemas/users");
let bcrypt = require('bcrypt');

module.exports = {
    CreateAnUser: async function (username, password,
        email, role, fullName, avatarUrl, status
    ) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            role: role,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status

        });
        await newItem.save();
        return newItem;
    },
    FindByID: async function (id) {
        return await userModel
            .findOne({
                _id: id,
                isDeleted: false
            }).populate({
                path: 'role', select: 'name'
            });
    },
    FindByUsername: async function (username) {
        return await userModel.findOne(
            {
                username: username,
                isDeleted: false
            }
        )
    },
    getAllUser: async function () {
        let users = await userModel
            .find({ isDeleted: false }).
            populate({ path: 'role', select: 'name' })
        return users;
    },
    UpdateUser: async function (id, data) {
        return await userModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            data,
            { new: true }
        );
    },
    DeleteUser: async function (id) {
        return await userModel.findOneAndUpdate(
            { _id: id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
    },
    // Đổi mật khẩu: bypass pre-save hook bằng cách hash thủ công rồi dùng findByIdAndUpdate
    changePassword: async function (userId, newPassword) {
        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(newPassword, salt);
        return await userModel.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        );
    }
}