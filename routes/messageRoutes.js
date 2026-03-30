const express = require('express');
const mongoose = require('mongoose');

const Message = require('../models/Message');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/:userID', async (req, res) => {
    try {
        const currentUserID = req.user._id;
        const targetUserID = req.params.userID;

        if (!mongoose.Types.ObjectId.isValid(targetUserID)) {
            return res.status(400).json({ success: false, message: 'userID is invalid.' });
        }

        const messages = await Message.find({
            $or: [
                { from: currentUserID, to: targetUserID },
                { from: targetUserID, to: currentUserID }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const currentUserID = req.user._id;
        const { to, contentMessage } = req.body;

        if (!to || !contentMessage || !contentMessage.type || !contentMessage.content) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: to, contentMessage.type, contentMessage.content'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(to)) {
            return res.status(400).json({
                success: false,
                message: 'Recipient ID is invalid.'
            });
        }

        if (String(currentUserID) === String(to)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot send a message to yourself.'
            });
        }

        const recipient = await User.findById(to).select('_id');
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Recipient does not exist.'
            });
        }

        const newMessage = new Message({
            from: currentUserID,
            to,
            contentMessage: {
                type: contentMessage.type,
                content: contentMessage.content
            }
        });

        await newMessage.save();

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const currentUserID = req.user._id;
        const userObjectId = new mongoose.Types.ObjectId(currentUserID);

        const recentMessages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { from: userObjectId },
                        { to: userObjectId }
                    ]
                }
            },
            {
                $addFields: {
                    partner: {
                        $cond: [
                            { $eq: ['$from', userObjectId] },
                            '$to',
                            '$from'
                        ]
                    }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: '$partner',
                    lastMessage: { $first: '$$ROOT' }
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        res.status(200).json({ success: true, data: recentMessages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
