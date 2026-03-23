var express = require("express");
let userModel = require("../schemas/users");
module.exports = {
    CreateAnUser: async function (username, password,
        email, role, fullName, avatarUrl, status,session
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
        await newItem.save({session});
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
    }, FindByEmail: async function (email) {
        return await userModel.findOne(
            {
                email: email,
                isDeleted: false
            }
        )
    },
    FindByToken: async function (token) {
        let user = await userModel.findOne(
            {
                forgotPasswordToken: token,
                isDeleted: false
            }
        )
        if (user && user.forgotPasswordTokenExp > Date.now()) {
            return user;
        }
        return undefined
    },
    importUsers: async function (usersData) {
        const crypto = require('crypto');
        const mailHandler = require('../utils/mailHandler');
        let results = [];
        for (let data of usersData) {
            const { username, email, role } = data;
            const plainPassword = crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '').padEnd(16, 'A').slice(0, 16);
            
            let newItem = new userModel({
                username: username,
                password: plainPassword,
                email: email,
                role: role,
                status: true
            });
            await newItem.save();
            await mailHandler.sendPasswordMail(email, username, plainPassword);
            results.push(newItem);
        }
        return results;
    },
    getAllUser: async function () {
        let users = await userModel
            .find({ isDeleted: false }).
            populate({ path: 'role', select: 'name' })
        return users;
    }
}