import { createApp } from './app'

const app = createApp()
const port = process.env.PORT || 4000

app.listen(port, () => {
  console.log(`📡 Server running on http://localhost:${port}`)
})
