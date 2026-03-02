const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);

// Root route
app.get("/", (req, res) => {
    res.json({ message: "User & Role CRUD API is running!" });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3000;
const MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/s2_taogiahan";

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("Đã kết nối MongoDB thành công");
        app.listen(PORT, () => {
            console.log(`Server đang chạy tại http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Lỗi kết nối MongoDB:", err.message);
    });
