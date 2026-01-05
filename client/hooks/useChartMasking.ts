import { useEffect, useState } from 'react'

export function useChartMasking() {
  const [diagonalPattern, setDiagonalPattern] = useState<CanvasPattern | string | undefined>(
    undefined,
  )

  useEffect(() => {
    // Create a diagonal pattern canvas for masked (filtered) data regions
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 10
    canvas.height = 10

    if (ctx) {
      // 1. Fill background with very light gray
      ctx.fillStyle = 'rgba(0, 0, 0, 0.01)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 2. Draw a diagonal line for the pattern
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 10)
      ctx.lineTo(10, 0)
      ctx.stroke()

      // 3. Create a pattern object and store it in state
      const pattern = ctx.createPattern(canvas, 'repeat')
      if (pattern) setDiagonalPattern(pattern)
    }
  }, [])

  return diagonalPattern
}
