import { Request, Response } from 'express'
import { pool } from '../db/pool'
import { FilterCondition } from '../types/filter.types'

/**
 * GET /api/sensors
 * Fetches the 100 most recent sensor readings
 * Ordered by result_time descending for real-time dashboard use
 */
export async function getSensorsLatest(req: Request, res: Response) {
  try {
    const result = await pool.query(
      'SELECT * FROM smart_sensors ORDER BY result_time DESC LIMIT 100',
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
}

/**
 * GET /api/sensors/explorer
 * Fetches the data within the time range
 * @param start - start time of the time range (ISO 8601 string, e.g., 2025-12-30T00:00:00Z)
 * @param end - end time of the time range (ISO 8601 string)
 * @param nodeId - the unique identifier of the sensor node
 */
export async function getSensorsExplorer(req: Request, res: Response) {
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

    let interval = '10 seconds'
    if (diffInHours <= 1) interval = '10 seconds'
    else if (diffInHours <= 6) interval = '1 minute'
    else if (diffInHours <= 24) interval = '5 minutes'
    else if (diffInHours <= 72) interval = '15 minutes'
    else interval = '1 hour'

    // dynamic filter
    let activeFilters: FilterCondition[] = []
    try {
      if (filters) activeFilters = JSON.parse(filters as string)
    } catch (err) {
      console.error('Filter parsing error: ', err)
    }

    const conditionStr =
      activeFilters.length > 0
        ? activeFilters
            .map((f) => {
              const agg = f.column === 'pir' ? 'MAX' : 'AVG'
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
}

/**
 * GET /api/sensors/range
 * Fetches the time range of the existing sensor data
 */
export async function getSensorsRange(req: Request, res: Response) {
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
}

/**
 * GET /api/sensors/:nodeId
 * Fetches the 50 most recent readings for a specific sensor node
 * @param nodeId - The unique identifier of the sensor node
 */
export async function getSensorsByNodeId(req: Request, res: Response) {
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
}
