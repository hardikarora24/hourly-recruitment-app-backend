import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import connection from './config/MongooseConfig.js'
import { initPassport } from './config/PassportConfig.js'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'

import {
  loginUser,
  logout,
  returnUser,
  registerUser,
} from './routes/AuthRoutes.js'
import {
  privateRoute,
  adminRoute,
  clientRoute,
  freelancerRoute,
} from './routes/Middleware.js'

const PORT = process.env.PORT || 5001

const app = express()
const allowedOrigins = [process.env.ORIGIN]
const options = {
  origin: allowedOrigins,
  credentials: true,
}

app.use(cors(options))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session
app.use(cookieParser(process.env.SESSION_SECRET))
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    },
  })
)

// Passport
app.use(passport.initialize())
app.use(passport.session())
initPassport()

// Auth Routes
app.post('/login', loginUser)
app.post('/register', registerUser)
app.get('/user', returnUser)
app.get('/logout', logout)

// Test Route
app.get('/', (req, res) => {
  res.send('hello world')
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
