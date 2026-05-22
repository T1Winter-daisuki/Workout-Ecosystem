import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRouter from './2_auth/auth.routes'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Ecosystem API is running' })
})

// Routes
app.use('/api/auth', authRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})