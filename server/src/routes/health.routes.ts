import { Router } from 'express'

export const healthRouter = Router()

/**
 * Health Check Endpoint
 * Used to verify if the API server is up and running
 */
healthRouter.get('/health', (req, res) => {
  res.send('API Server is running! 🚀')
})
