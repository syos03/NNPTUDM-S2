const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true } // Demo: Không băm pass cho đơn giản
});

module.exports = mongoose.model('User', userSchema);
