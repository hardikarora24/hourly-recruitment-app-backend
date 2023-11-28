import app from './index.js'

const PORT = process.env.PORT || 5001

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`)
})
