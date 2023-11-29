import passport from 'passport'
import bcrypt from 'bcryptjs'
import { User } from '../schema/User.js'

const loginUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    console.log({ body: req.body, user, requser: req.user })
    if (err) {
      console.error(err)
      return res
        .status(503)
        .json({ success: false, message: 'Could not authenticate', error: err })
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'Incorrect username' })
    }

    req.logIn(user, async (err) => {
      if (err) throw err

      res.json({
        success: true,
        user,
      })
    })
  })(req, res, next)
}

const registerUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username })
    if (user) {
      return res.status(422).json({ success: false, message: 'Username taken' })
    }

    const newUser = User({
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, 10),
      createdAt: Date.now(),
      type: req.body.type,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      skills: req.body.skills,
    })

    newUser.save()

    return res.status(201).json({ success: true, user: newUser })
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
