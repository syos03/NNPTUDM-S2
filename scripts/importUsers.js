const mongoose = require('mongoose');
const crypto = require('crypto');
const userModel = require('../schemas/users');
const roleModel = require('../schemas/roles');
const mailHandler = require('../utils/mailHandler');

const MONGO_URI = 'mongodb://localhost:27017/NNPTUD-S2';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function importUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Ensure a default role exists
        let userRole = await roleModel.findOne({ name: 'USER' });
        if (!userRole) {
            userRole = new roleModel({
                name: 'USER',
                description: 'Default user role'
            });
            await userRole.save();
            console.log("Created 'USER' role");
        }

        // 2. Loop from 1 to 99
        for (let i = 1; i <= 99; i++) {
            const num = i.toString().padStart(2, '0');
            const username = `user${num}`;
            const email = `user${num}@haha.com`;
            
            // Check if user already exists
            const existingUser = await userModel.findOne({ username });
            if (existingUser) {
                console.log(`User ${username} already exists, skipping.`);
                continue;
            }

            // Generate 16-char random password
            const password = crypto.randomBytes(8).toString('hex');

            // Create new user
            const newUser = new userModel({
                username,
                email,
                password, // Will be hashed by pre-save hook
                role: userRole._id,
                status: true
            });

            await newUser.save();
            console.log(`Created user: ${username} with password: ${password}`);

            // Send email
            try {
                await mailHandler.sendPasswordMail(email, password);
                console.log(`Sent email to ${email}`);
                // Add delay to avoid rate limiting
                await delay(15000); 
            } catch (err) {
                console.error(`Failed to send email to ${email}: ${err.message}`);
            }
        }

        console.log("Import completed successfully.");
    } catch (error) {
        console.error("Error importing users:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

importUsers();
