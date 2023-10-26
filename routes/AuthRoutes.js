import passport from 'passport'
import bcrypt from 'bcryptjs'
import { USER_TYPES, User } from '../schema/User.js'
import { Client } from '../schema/Client.js'
import { Freelancer } from '../schema/Freelancer.js'
import connection from '../config/MongooseConfig.js'

const loginUser = (req, res, next) => {
  passport.authenticate('local', (err, baseUser, info) => {
    if (err) {
      console.error(err)
      return res
        .status(503)
        .json({ success: false, message: 'Could not authenticate', error: err })
    }

    if (!baseUser) {
      return res
        .status(404)
        .json({ success: false, message: 'Incorrect username' })
    }

    req.logIn(baseUser, async (err) => {
      if (err) throw err

      const userCB = (err, user) => {
        if (err) {
          console.error(err)
          return res.status(503).json({
            success: false,
            message: 'Could not authenticate',
            error: err,
          })
        }

        res.json({
          success: true,
          user,
        })
      }

      if (baseUser.type === USER_TYPES.admin) {
        userCB(null, baseUser)
      } else if (baseUser.type === USER_TYPES.client) {
        const client = await Client.findOne({ _id: baseUser.user_id })
        userCB(null, { ...baseUser, ...client })
      } else {
        const freelancer = await Freelancer.findOne({ _id: baseUser.user_id })
        userCB(null, { ...baseUser, ...freelancer })
      }
    })
  })(req, res, next)
}

const registerUser = async (req, res) => {
  const session = await connection.startSession()
  try {
    const user = await User.findOne({ username: req.body.username })
    if (user) {
      return res.status(422).json({ success: false, message: 'Username taken' })
    }

    const newUser = {
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, 10),
      createdAt: Date.now(),
      type: req.body.type,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
    }

    const newUserWithType =
      req.body.type === USER_TYPES.client
        ? { projects: [] }
        : req.body.type === USER_TYPES.freelancer
        ? {
            active_bids: [],
            active_projects: [],
            total_earnings: 0,
          }
        : null

    session.startTransaction()
    const [createdUser] = await User.create([newUser], { session })
    if (req.body.type === USER_TYPES.client) {
      await Client.create([{ ...newUserWithType, user_id: createdUser._id }], {
        session,
      })
    } else if (req.body.type === USER_TYPES.freelancer) {
      await Freelancer.create(
        [{ ...newUserWithType, user_id: createdUser._id }],
        { session }
      )
    }
    await session.commitTransaction()
    session.endSession()

    return res
      .status(201)
      .json({ success: true, user: { ...newUser, ...newUserWithType } })
  } catch (err) {
    console.error(err)
    res.status(503).json({ success: false, message: 'Could not register user' })
  }
}

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(503).json({ success: false, message: err })
    }
    return res.status(200).json({ success: true })
  })
}

const returnUser = (req, res) => {
  if (!req.user) {
    return res.status(404).json({ success: false, message: 'Not logged in' })
  }

  res.status(200).json({ success: true, user: req.user })
}

export { loginUser, logout, returnUser, registerUser }
