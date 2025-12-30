import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// DB Connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

/**
 * Health Check Endpoint
 * Used to verify if the API server is up and running
 */
app.get('/api/health', (req, res) => {
    res.send('API Server is running! 🚀');
});

/**
 * GET /api/sensors
 * Fetches the 100 most recent sensor readings
 * Ordered by result_time descending for real-time dashboard use
 */
app.get('/api/sensors', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM smart_sensors ORDER BY result_time DESC LIMIT 100'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * GET /api/sensors/:nodeId
 * Fetches the 50 most recent readings for a specific sensor node
 * @param nodeId - The unique identifier of the sensor node
 */
app.get('/api/sensors/:nodeId', async (req, res) => {
    const { nodeId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM smart_sensors WHERE nodeid = $1 ORDER BY result_time DESC LIMIT 50',
            [nodeId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`📡 Server running on http://localhost:${port}`);
});