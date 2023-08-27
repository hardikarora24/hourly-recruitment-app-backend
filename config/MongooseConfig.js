import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

mongoose.connect(process.env.DB_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const connection = mongoose.connection

connection.on('error', () => console.error('Could not connect to Database'))

connection.once('open', () => console.info('Connected to Database'))

export default connection
