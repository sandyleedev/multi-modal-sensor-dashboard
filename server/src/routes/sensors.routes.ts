import { Router } from 'express'
import {
  getSensorsLatest,
  getSensorsExplorer,
  getSensorsRange,
  getSensorsByNodeId,
} from '../controllers/sensors.controller'

export const sensorsRouter = Router()

sensorsRouter.get('/', getSensorsLatest)
sensorsRouter.get('/explorer', getSensorsExplorer)
sensorsRouter.get('/range', getSensorsRange)
sensorsRouter.get('/:nodeId', getSensorsByNodeId)
