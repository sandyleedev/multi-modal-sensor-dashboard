import express from 'express'
import cors from 'cors'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import { FilterCondition } from './types/filter.types'
import path from 'path'

// Load environment variables based on the execution environment
if (process.env.NODE_ENV !== 'production') {
  // In development: Manually load .env from the project root
  dotenv.config({ path: path.resolve(__dirname, '../.env') })
} else {
  // In production (Docker): Use environment variables injected into the system container
  dotenv.config()
}

const app = express()
const port = process.env.PORT || 4000
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000'

const corsOptions = {
  origin: allowedOrigin,
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(express.json())

// DB Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
})

/**
 * Health Check Endpoint
 * Used to verify if the API server is up and running
 */
app.get('/api/health', (req, res) => {
  res.send('API Server is running! 🚀')
})

/**
 * GET /api/sensors
 * Fetches the 100 most recent sensor readings
 * Ordered by result_time descending for real-time dashboard use
 */
app.get('/api/sensors', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM smart_sensors ORDER BY result_time DESC LIMIT 100',
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

/**
 * GET /api/sensors/explorer
 * Fetches the data within the time range
 * @param start - start time of the time range (ISO 8601 string, e.g., 2025-12-30T00:00:00Z)
 * @param end - end time of the time range (ISO 8601 string)
 * @param nodeId - the unique identifier of the sensor node
 */
app.get('/api/sensors/explorer', async (req, res) => {
  const { start, end, nodeId, filters } = req.query

  if (!start || !end || !nodeId) {
    return res.status(400).json({
      error: 'Missing required parameters',
      details: 'start, end, and nodeId are all required',
    })
  }

  console.log(
    `[${new Date().toISOString()}] GET /api/sensors/explorer - nodeId: ${nodeId}, range: ${start} - ${end}`,
  )

  try {
    const startTime = new Date(start as string)
    const endTime = new Date(end as string)
    const diffInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

    /**
     * Determine the grouping interval based on the time span.
     * This prevents the frontend from being overwhelmed by too many data points.
     */
    let interval = '10 seconds' // Default for very short ranges

    if (diffInHours <= 1) {
      interval = '10 seconds' // 1 hour or less: 10s intervals
    } else if (diffInHours <= 6) {
      interval = '1 minute' // Up to 6 hours: 1m intervals
    } else if (diffInHours <= 24) {
      interval = '5 minutes' // Up to 1 day: 5m intervals
    } else if (diffInHours <= 72) {
      interval = '15 minutes' // Up to 3 days: 15m intervals
    } else {
      interval = '1 hour' // More than 3 days: 1h intervals
    }

    // dynamic filter
    let activeFilters = []
    try {
      if (filters) {
        activeFilters = JSON.parse(filters as string)
      }
    } catch (err) {
      console.error('Filter parsing error: ', err)
    }

    const conditionStr =
      activeFilters.length > 0
        ? activeFilters
            .map((f: FilterCondition) => {
              const agg = f.column == 'pir' ? 'MAX' : 'AVG'
              return `${agg}(${f.column}) ${f.operator} ${f.value}`
            })
            .join(' AND ')
        : '1=1'

    const query = `
      SELECT
        date_bin($1, result_time, TIMESTAMP '2000-01-01') AS time_bucket,
        CASE WHEN ${conditionStr} THEN AVG(temp) ELSE NULL END AS temp,
        CASE WHEN ${conditionStr} THEN AVG(humid) ELSE NULL END AS humid,
        CASE WHEN ${conditionStr} THEN AVG(bright) ELSE NULL END AS bright,
        CASE WHEN ${conditionStr} THEN AVG(soundlevel) ELSE NULL END AS soundlevel,
        CASE WHEN ${conditionStr} THEN MAX(pir) ELSE NULL END AS pir
      FROM smart_sensors
      WHERE nodeid = $2 AND result_time BETWEEN $3 AND $4
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `

    const result = await pool.query(query, [interval, nodeId, start, end])
    const formattedData = result.rows.map((row) => ({
      ...row,
      result_time: row.time_bucket,
      temp: row.temp === null ? null : parseFloat(Number(row.temp).toFixed(1)),
      humid: row.humid === null ? null : parseFloat(Number(row.humid).toFixed(1)),
      bright: row.bright === null ? null : parseFloat(Number(row.bright).toFixed(2)),
      soundlevel: row.soundlevel === null ? null : parseFloat(Number(row.soundlevel).toFixed(2)),
      pir: row.pir,
    }))

    res.json(formattedData)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

/**
 * GET /api/sensors/range
 * Fetches the time range of the existing sensor data
 */
app.get('/api/sensors/range', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        MIN(result_time) AS min_time,
        MAX(result_time) AS max_time
      FROM smart_sensors
      `,
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error fetching data from DB', err)
    res.status(500).json({ error: 'Database error' })
  }
})

/**
 * GET /api/sensors/:nodeId
 * Fetches the 50 most recent readings for a specific sensor node
 * @param nodeId - The unique identifier of the sensor node
 */
app.get('/api/sensors/:nodeId', async (req, res) => {
  const { nodeId } = req.params
  try {
    const result = await pool.query(
      'SELECT * FROM smart_sensors WHERE nodeid = $1 ORDER BY result_time DESC LIMIT 50',
      [nodeId],
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`📡 Server running on http://localhost:${port}`)
})
