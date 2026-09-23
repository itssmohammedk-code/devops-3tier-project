const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "devopsuser",
    password: process.env.DB_PASSWORD || "devopspassword",
    database: process.env.DB_NAME || "devopsdb",
    port: 3306
});

// Health check
app.get("/health", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            status: "healthy",
            database: "connected"
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);

        res.status(500).json({
            status: "unhealthy",
            database: "disconnected"
        });
    }
});

// Test database endpoint
app.get("/db-test", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT DATABASE() AS database_name");

        res.json({
            message: "Database connection successful",
            database: rows[0].database_name
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

app.get("/", (req, res) => {
    res.send("DevOps 3-Tier Application Backend is running!");
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});