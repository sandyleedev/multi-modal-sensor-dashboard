import express from 'express'
import cors from 'cors'
import { healthRouter } from './routes/health.routes'
import { sensorsRouter } from './routes/sensors.routes'
import { tbiRouter } from './routes/tbi.routes'

export function createApp() {
  const app = express()

  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000'

  const corsOptions = {
    origin: allowedOrigin,
    optionsSuccessStatus: 200,
  }

  app.use(cors(corsOptions))
  app.use(express.json())

  // root path
  app.get('/', (req, res) => {
    res.send('Temperature-Based Interaction Explorer API 🚀')
  })

  // routes
  app.use('/api', healthRouter)
  app.use('/api/sensors', sensorsRouter)
  app.use('/api/tbi', tbiRouter)

  return app
}
