import { User, USER_TYPES } from '../Schema/User.js'
import { Freelancer } from '../Schema/Freelancer.js'
import { Client } from '../Schema/Client.js'
import bcrypt from 'bcryptjs'
import passport from 'passport'
import localStrategy from 'passport-local'

const findUserByUsername = (username) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ username: username })
      resolve(user)
    } catch (e) {
      console.error(e)
      reject(e)
    }
  })
}

const comparePassword = (user, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      const isMatch = await bcrypt.compare(password, user.password)
      if (isMatch) {
        resolve(true)
      } else {
        reject('Incorrect password')
      }
    } catch (e) {
      reject(e)
    }
  })
}

const findUserById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ _id: id })
      resolve(user)
    } catch (e) {
      reject(e)
    }
  })
}

const initPassport = () => {
  passport.use(
    new localStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          const user = await findUserByUsername(username)

          if (!user) {
            done(null, false)
          } else {
            const isCorrectPassword = await comparePassword(user, password)

            if (isCorrectPassword) {
              return done(null, user, null)
            } else {
              return done(null, false)
            }
          }
        } catch (e) {
          return done(null, false, e)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    findUserById(id)
      .then((user) => {
        return done(null, user)
      })
      .catch((error) => {
        return done(error, null)
      })
  })
}

export { comparePassword, findUserByUsername, findUserById, initPassport }
