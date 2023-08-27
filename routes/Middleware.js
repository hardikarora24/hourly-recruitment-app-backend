import { USER_TYPES } from '../Schema/User.js'

const privateRoute = (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res
      .status(401)
      .json({ success: false, message: 'Missing Authetication' })
  }

  next()
}

const adminRoute = (req, res, next) => {
  if (req.user.type === USER_TYPES.admin) {
    next()
  } else {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid Credentials' })
  }
}

const clientRoute = (req, res, next) => {
  if (req.user.type === USER_TYPES.client) {
    next()
  } else {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid Credentials' })
  }
}

const freelancerRoute = (req, res, next) => {
  if (req.user.type === USER_TYPES.freelancer) {
    next()
  } else {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid Credentials' })
  }
}

export { privateRoute, adminRoute, clientRoute, freelancerRoute }
