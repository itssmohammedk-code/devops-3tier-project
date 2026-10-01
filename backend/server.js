const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;
const startedAt = Date.now();
const requestCounts = new Map();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.on("finish", () => {
        if (req.path === "/metrics") return;
        const route = req.route?.path || "unmatched";
        const key = `${req.method}\t${route}\t${res.statusCode}`;
        requestCounts.set(key, (requestCounts.get(key) || 0) + 1);
    });
    next();
});

// MySQL connection
if (!process.env.DB_PASSWORD) {
    throw new Error("DB_PASSWORD must be set through the environment");
}

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "devopsuser",
    password: process.env.DB_PASSWORD,
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

// Liveness only checks that the process is serving requests.
app.get("/live", (req, res) => {
    res.json({ status: "alive" });
});

// Readiness includes the database because API requests depend on it.
app.get("/ready", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({ status: "ready" });
    } catch (error) {
        res.status(503).json({ status: "not_ready" });
    }
});

// Minimal Prometheus text format metrics with bounded route labels.
app.get("/metrics", (req, res) => {
    const lines = [
        "# HELP process_uptime_seconds Time since the backend process started.",
        "# TYPE process_uptime_seconds gauge",
        `process_uptime_seconds ${(Date.now() - startedAt) / 1000}`,
        "# HELP http_requests_total Completed HTTP requests by route, method, and status.",
        "# TYPE http_requests_total counter"
    ];
    for (const [key, count] of requestCounts) {
        const [method, route, status] = key.split("\t");
        const labels = `method="${method}",route="${route}",status="${status}"`;
        lines.push(`http_requests_total{${labels}} ${count}`);
    }
    res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8").send(`${lines.join("\n")}\n`);
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
