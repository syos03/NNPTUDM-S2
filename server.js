require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const messageRoutes = require('./routes/messageRoutes');
const { hashPassword, verifyPassword } = require('./utils/password');

const app = express();
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-test';
const JWT_SECRET = process.env.JWT_SECRET;
const TEST_LOGIN_ENABLED = process.env.TEST_LOGIN_ENABLED === 'true';

if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET. Set it in your environment or .env file.');
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('MongoDB connection error:', err));

app.post('/test-login', async (req, res) => {
    try {
        if (!TEST_LOGIN_ENABLED) {
            return res.status(403).json({ message: 'Test login is disabled.' });
        }

        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'username and password are required.' });
        }

        let user = await User.findOne({ username });
        if (!user) {
            user = new User({
                username,
                password: hashPassword(password)
            });
            await user.save();
        } else if (!verifyPassword(password, user.password)) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Use this token in Authorization: Bearer <token>',
            user_id: user._id,
            username: user.username,
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use('/api/messages', messageRoutes);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
