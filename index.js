import dotenv from 'dotenv'
dotenv.config()
import express from 'express'

const app = express()
const PORT = process.env.PORT || 5001

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
