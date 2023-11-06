import checkMasterCredentials from '../utils/checkMasterCredentials.js'
import { USER_TYPES, User } from '../schema/User.js'
import bcrypt from 'bcryptjs'

const masterLogin = (req, res) => {
  const invalidCredentials = req.query.invalidCredentials === 'true'
  res.render('index.pug', {
    invalidCredentials,
  })
}

const checkCredentialMW = (req, res, next) => {
  const result = checkMasterCredentials({
    username: req.body.masterUsername,
    password: req.body.masterPassword,
  })

  if (!result) {
    res.redirect('/?invalidCredentials=true')
    return
  }

  next()
}

const masterHome = (req, res) => {
  res.render('home.pug', {
    masterUsername: req.body.masterUsername,
    masterPassword: req.body.masterPassword,
  })
}

const addAdmin = (req, res) => {
  res.render('adminTemplate.pug', {
    masterUsername: req.body.masterUsername,
    masterPassword: req.body.masterPassword,
  })
}

const createAdmin = async (req, res) => {
  const { username, password, first_name, last_name } = req.body
  try {
    const user = await User.findOne({ username: username })

    if (user)
      return res.status(409).json({ success: false, message: 'username taken' })

    const hash = await bcrypt.hash(password, 10)

    const newUser = new User({
      username: username,
      password: hash,
      type: USER_TYPES.admin,
      first_name,
      last_name,
      createdAt: Date.now(),
    })

    await newUser.save()

    res.status(200).json({ success: true })
  } catch (e) {
    console.log(e)
    return res.status(503).json({ success: false, message: 'Could not add' })
  }
}

const viewAdmins = async (req, res) => {
  try {
    const admins = await User.find({ type: USER_TYPES.admin })

    const adminInfo = admins.map((admin) => {
      return { username: admin.username, id: admin._id }
    })

    res.render('viewAdmins.pug', {
      masterUsername: req.body.masterUsername,
      masterPassword: req.body.masterPassword,
      admins: adminInfo,
    })
  } catch (e) {
    return res
      .status(503)
      .json({ success: false, message: 'Could not get admins' })
  }
}

const deleteAdmin = async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.body.id })
    return res.status(204).json({ success: true })
  } catch (e) {
    return res.status(503).json({ success: false, message: 'Could not delete' })
  }
}

export {
  masterLogin,
  masterHome,
  createAdmin,
  checkCredentialMW,
  addAdmin,
  viewAdmins,
  deleteAdmin,
}
