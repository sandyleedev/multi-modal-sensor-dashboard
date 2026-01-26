import { Router } from 'express'
import { getTbiCategories, getTbiCases } from '../controllers/tbi.controller'

export const tbiRouter = Router()

// Filter options (category list)
tbiRouter.get('/categories', getTbiCategories)

// Case list (search / filter / pagination)
tbiRouter.get('/cases', getTbiCases)
