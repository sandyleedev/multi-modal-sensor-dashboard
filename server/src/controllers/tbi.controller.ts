import { Request, Response } from 'express'
import { pool } from '../db/pool'

/**
 * GET /api/tbi/categories
 *
 * [What this API does]
 * - Returns the list of categories to be displayed in the filter panel (left-side UI).
 * - Fetches rows from `tbi_categories` and groups them by type (scenario/technology).
 *
 * [Why this is needed]
 * - Instead of hardcoding filter options on the frontend, storing them in the database
 *   makes it easier to maintain and update categories (e.g., adding new categories
 *   or changing the display order).
 *
 * [Response example]
 * {
 *   "scenario": [
 *     { "id": 1, "name": "VR/AR", "slug": "vr-ar", "sortOrder": 10 }
 *   ],
 *   "technology": [
 *     { "id": 10, "name": "Wearable", "slug": "wearable", "sortOrder": 30 }
 *   ]
 * }
 */
export async function getTbiCategories(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `
      SELECT id, type, name, slug, sort_order
      FROM tbi_categories
      ORDER BY type ASC, sort_order ASC, name ASC
      `,
    )

    // Create an object to group categories by their type.
    // e.g. grouped["scenario"] = [ ... ]
    //      grouped["technology"] = [ ... ]
    const grouped: Record<string, any[]> = {}

    for (const row of result.rows) {
      // key: category type (e.g., "scenario", "technology", ...)
      const key = row.type as string

      // Initialize an empty array if grouped[key] does not exist yet.
      grouped[key] ??= []
      grouped[key].push({
        id: row.id,
        name: row.name,
        slug: row.slug,
        sortOrder: row.sort_order,
      })
    }

    res.json(grouped)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
}

/**
 * GET /api/tbi/cases
 *
 * [What this API does]
 * - Returns a list of technology cases.
 * - Supports search (q), category filtering (scenario/technology), and pagination (page/pageSize).
 * - Includes the related categories (tags) for each case in the response.
 *
 * [Why this is needed]
 * - This is the core API for the Explore page (the right-side result/card list).
 * - It satisfies the job requirement of real-time filtering and category selection.
 *
 * Query params:
 * - q: search keyword (matches against title/summary)
 * - scenario: repeatable (e.g., ?scenario=VR/AR&scenario=Healthcare)
 * - technology: repeatable
 * - page: page number (default: 1)
 * - pageSize: number of items per page (default: 12, max: 50)
 *
 * [Response example]
 * {
 *   "page": 1,
 *   "pageSize": 12,
 *   "total": 15,
 *   "totalPages": 2,
 *   "items": [
 *     {
 *       "id": 1,
 *       "title": "...",
 *       "summary": "...",
 *       "year": 2023,
 *       "tags": {
 *         "scenario": ["Communication"],
 *         "technology": ["Wearable", "Heater"]
 *       }
 *     }
 *   ]
 * }
 */
export async function getTbiCases(req: Request, res: Response) {
  try {
    /**
     * -------------------------------------------
     * 1) Parse query parameters
     * -------------------------------------------
     */

    // q: search keyword (empty string if not provided)
    // trim() removes extra spaces (e.g., "  thermal  " -> "thermal")
    const q = (req.query.q as string | undefined)?.trim() || ''

    // page: minimum value is 1
    // Math.max prevents invalid values like 0 or negative numbers
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1)

    // pageSize: limit to the range 1~50
    // max 50 is used to avoid heavy queries / server overload
    const pageSize = Math.min(Math.max(parseInt((req.query.pageSize as string) || '5', 10), 1), 50)

    /**
     * Express parse query as a string or string[].
     * e.g.)
     * scenario/technology in the query string can be:
     * - a single value (e.g., scenario=VR/AR)
     * - repeated values / array-like (e.g., scenario=VR/AR&scenario=Healthcare)
     */
    const scenarioRaw = req.query.scenario
    const technologyRaw = req.query.technology

    // Normalize scenarios to always be a string[]
    const scenarios =
      typeof scenarioRaw === 'string'
        ? [scenarioRaw]
        : Array.isArray(scenarioRaw)
          ? scenarioRaw
          : []

    // Normalize technologies to always be a string[]
    const technologies =
      typeof technologyRaw === 'string'
        ? [technologyRaw]
        : Array.isArray(technologyRaw)
          ? technologyRaw
          : []

    /**
     * -------------------------------------------
     * 2) Build dynamic WHERE conditions
     * -------------------------------------------
     *
     * Goals:
     * - If q exists, add a title/summary search condition
     * - If type filters exist, add type matching conditions
     *
     * Notes:
     * - Use params + placeholders ($1, $2, ...) to prevent SQL injection
     * - Collect conditions in whereParts and combine them with AND
     */

    const params: any[] = [] // parameters to be passed into pool.query
    let idx = 1 // placeholder index counter ($1, $2, ...)

    let whereParts: string[] = []

    // (1) Search condition: match q against title or summary
    if (q) {
      /**
       * Split the search string into multiple words:
       * - handle multiple spaces safely
       * - ignore very short words (e.g., "a", "of") to reduce noise
       */
      const words = q
        .split(/\s+/)
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length >= 2)

      // Remove duplicates using Set, and optionally limit the number of keywords
      // to prevent overloading the query with too many conditions.
      const limitedWords = [...new Set(words)].slice(0, 10)

      // Add one ILIKE condition per keyword
      for (const word of limitedWords) {
        params.push(`%${word}%`)
        whereParts.push(`(c.title ILIKE $${idx} OR c.summary ILIKE $${idx})`)
        idx++
      }
    }

    /**
     * (2) Scenario filter condition
     *
     * Why we use EXISTS:
     * - If we JOIN categories directly, one case can produce multiple rows
     *   (because one case can have multiple categories).
     * - That row duplication can break pagination (LIMIT/OFFSET).
     *
     * EXISTS checks whether a matching relationship exists,
     * without increasing the number of rows returned.
     */
    if (scenarios.length > 0) {
      params.push(scenarios)
      whereParts.push(`
        EXISTS (
          SELECT 1
          FROM tbi_case_categories cc
          JOIN tbi_categories cat ON cat.id = cc.category_id
          WHERE cc.case_id = c.id
            AND cat.type = 'scenario'
            AND cat.name = ANY($${idx})
        )
      `)
      idx++
    }

    /**
     * (3) Technology filter condition
     * - Same pattern as scenario filtering, using EXISTS for safe pagination
     */
    if (technologies.length > 0) {
      params.push(technologies)
      whereParts.push(`
        EXISTS (
          SELECT 1
          FROM tbi_case_categories cc
          JOIN tbi_categories cat ON cat.id = cc.category_id
          WHERE cc.case_id = c.id
            AND cat.type = 'technology'
            AND cat.name = ANY($${idx})
        )
      `)
      idx++
    }

    // If we have any conditions, build "WHERE ... AND ..."
    // Otherwise, keep it empty.
    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : ''

    /**
     * -------------------------------------------
     * 3) Fetch total count (for pagination UI)
     * -------------------------------------------
     *
     * We need the total number of matched items to calculate totalPages.
     * COUNT(*) usually returns a big integer type in Postgres,
     * so we cast it to int (::int) for easier handling on the frontend.
     */
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM tbi_cases c
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, params)
    const total = countResult.rows[0]?.total ?? 0

    /**
     * -------------------------------------------
     * 4) Fetch the page data (LIMIT/OFFSET)
     * -------------------------------------------
     *
     * Since filtering is done with EXISTS (without creating duplicate rows),
     * pagination works correctly at the case level.
     */

    // offset is the number of rows to skip before starting to return results
    // page 1: (1 - 1) * pageSize = 0 (skip nothing)
    // page 2: (2 - 1) * pageSize = pageSize (skip one full page)
    const offset = (page - 1) * pageSize

    params.push(pageSize)
    params.push(offset)

    // idx currently points to the next placeholder index after filter params
    // Therefore:
    // - LIMIT uses $idx
    // - OFFSET uses $(idx + 1)
    const dataQuery = `
      SELECT
        c.id, c.title, c.summary, c.year, c.link, c.created_at, c.updated_at
      FROM tbi_cases c
      ${whereClause}
      ORDER BY c.year DESC NULLS LAST, c.id DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `

    const casesResult = await pool.query(dataQuery, params)

    /**
     * -------------------------------------------
     * 5) Attach tags to each case
     * -------------------------------------------
     *
     * If we return only the case list, the frontend cannot display tag chips.
     * So we fetch the related categories for the cases returned in this page.
     *
     * Approach:
     * - Collect caseIds for the current page
     * - Query case_categories + categories using ONE query
     * - Group the result by case_id into a map (tagsByCaseId)
     */
    const caseIds = casesResult.rows.map((r) => r.id)

    // Map for quick lookup:
    // e.g., tagsByCaseId[1] = { scenario: [...], technology: [...] }
    let tagsByCaseId: Record<number, { scenario: string[]; technology: string[] }> = {}

    if (caseIds.length > 0) {
      const tagResult = await pool.query(
        `
        SELECT
          cc.case_id,
          cat.type,
          cat.name
        FROM tbi_case_categories cc
        JOIN tbi_categories cat ON cat.id = cc.category_id
        WHERE cc.case_id = ANY($1)
        ORDER BY cat.type ASC, cat.sort_order ASC, cat.name ASC
        `,
        [caseIds],
      )

      tagsByCaseId = {}
      for (const row of tagResult.rows) {
        const caseId = row.case_id as number

        // If tagsByCaseId[caseId] doesn't exist, initialize it
        if (!tagsByCaseId[caseId]) {
          tagsByCaseId[caseId] = { scenario: [], technology: [] }
        }

        // Push tag name into the correct bucket based on type
        if (row.type === 'scenario') tagsByCaseId[caseId].scenario.push(row.name)
        if (row.type === 'technology') tagsByCaseId[caseId].technology.push(row.name)
      }
    }

    /**
     * -------------------------------------------
     * 6) Build the final response payload
     * -------------------------------------------
     *
     * items = case info + tags (scenario/technology)
     */
    const items = casesResult.rows.map((c) => ({
      ...c,
      tags: tagsByCaseId[c.id] ?? { scenario: [], technology: [] },
    }))

    res.json({
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      items,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

/**
 * GET /api/tbi/cases/:id
 * - return single case detail + tags(scenario/technology)
 */
export async function getTbiCaseById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid case id' })
    }

    // 1) case detail
    const caseResult = await pool.query(
      `
      SELECT
        id, title, summary, detail, year, link, created_at, updated_at
      FROM tbi_cases
      WHERE id = $1
      `,
      [id],
    )

    const caseRow = caseResult.rows[0]
    if (!caseRow) {
      return res.status(404).json({ error: 'Case not found' })
    }

    // 2) tags
    const tagResult = await pool.query(
      `
      SELECT
        cat.type,
        cat.name
      FROM tbi_case_categories cc
      JOIN tbi_categories cat ON cat.id = cc.category_id
      WHERE cc.case_id = $1
      ORDER BY cat.type ASC, cat.sort_order ASC, cat.name ASC
      `,
      [id],
    )

    const tags = { scenario: [] as string[], technology: [] as string[] }
    for (const row of tagResult.rows) {
      if (row.type === 'scenario') tags.scenario.push(row.name)
      if (row.type === 'technology') tags.technology.push(row.name)
    }

    return res.json({
      ...caseRow,
      tags,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
