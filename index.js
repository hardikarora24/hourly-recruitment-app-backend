import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import http from 'http'
import cors from 'cors'
import { initPassport } from './config/PassportConfig.js'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'

import {
  masterLogin,
  masterHome,
  createAdmin,
  checkCredentialMW,
  addAdmin,
  viewAdmins,
  deleteAdmin,
} from './routes/Static.js'
import {
  loginUser,
  logout,
  returnUser,
  registerUser,
} from './routes/AuthRoutes.js'
import ClientRouter from './routes/Client.js'
import FreelancerRouter from './routes/Freelancer.js'
import AdminRouter from './routes/Admin.js'

const app = express()
const server = http.createServer(app)

const allowedOrigins = [process.env.ORIGIN]
const options = {
  origin: allowedOrigins,
  credentials: true,
}

app.use(cors(options))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'pug')
app.set('views', './views')

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

// Static Routes
app.get('/', masterLogin)
app.post('/home', checkCredentialMW, masterHome)
app.post('/view-admins', checkCredentialMW, viewAdmins)
app.post('/add-admin', checkCredentialMW, addAdmin)
app.post('/create-admin', checkCredentialMW, createAdmin)
app.post('/delete-admin', checkCredentialMW, deleteAdmin)

// Routes
app.use('/client', ClientRouter)
app.use('/freelancer', FreelancerRouter)
app.use('/admin', AdminRouter)

export default server
