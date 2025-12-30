import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { Pool } from 'pg'

// 1. Database connection configuration
const pool = new Pool({
  user: 'user',
  host: 'localhost', // Use 'localhost' for running the script directly on the server
  database: 'sensor_db',
  password: 'password',
  port: 5432,
})

async function runSeeder() {
  // 2. Resolve CSV file path (points to data.csv in the project root)
  const csvFilePath = path.resolve(__dirname, '../data.csv')
  const rows: any[] = []

  console.log('🚀 Reading CSV file...')

  if (!fs.existsSync(csvFilePath)) {
    console.error('❌ Error: File not found at:', csvFilePath)
    process.exit(1)
  }

  // 3. Parse CSV and insert data into DB
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => rows.push(data))
    .on('end', async () => {
      console.log(`✅ Parsing complete: ${rows.length} rows found. Starting DB insertion...`)

      const client = await pool.connect()
      try {
        await client.query('BEGIN') // Start transaction

        for (const row of rows) {
          const query = `
            INSERT INTO smart_sensors (temp, humid, bright, dist, soundthres, soundlevel, pir, result_time, nodeid)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `
          const values = [
            parseFloat(row.temp),
            parseFloat(row.humid),
            parseFloat(row.bright),
            parseFloat(row.dist),
            parseInt(row.soundthres),
            parseFloat(row.soundlevel),
            parseInt(row.pir),
            row.result_time, // Standard ISO timestamp format
            parseInt(row.nodeid),
          ]
          await client.query(query, values)
        }

        await client.query('COMMIT') // Commit transaction
        console.log('🎉 Data seeding completed successfully!')
      } catch (err) {
        await client.query('ROLLBACK') // Rollback on error
        console.error('❌ Error during insertion:', err)
      } finally {
        client.release()
        await pool.end()
      }
    })
}

runSeeder()
