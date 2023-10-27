import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import https from 'https'
import fs from 'fs'
import cors from 'cors'
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
  adminRoute,
  clientRoute,
  freelancerRoute,
  privateRoute,
} from './routes/Middleware.js'
import ClientRouter from './routes/Client.js'
import FreelancerRouter from './routes/Freelancer.js'
import AdminRouter from './routes/Admin.js'

const PORT = process.env.PORT || 5001

const key = fs.readFileSync('./key.pem')
const cert = fs.readFileSync('./cert.pem')

const app = express()
const server = https.createServer({ key: key, cert: cert }, app)

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
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      signed: true,
      sameSite: 'none',
      secure: true,
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

// Routes
app.use('/client', privateRoute, clientRoute, ClientRouter)
app.use('/freelancer', privateRoute, freelancerRoute, FreelancerRouter)
app.use('/admin', privateRoute, adminRoute, AdminRouter)

// Test Route
app.get('/', (req, res) => {
  res.send('hello world')
})

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
