import express from 'express'
import { User, USER_TYPES } from '../schema/User.js'
import { Project, PROJECT_STATUS } from '../schema/Project.js'

const AdminRouter = express.Router()

AdminRouter.get('/users', async (req, res) => {
  try {
    const users = await User.find({
      $or: [{ type: USER_TYPES.client }, { type: USER_TYPES.freelancer }],
    })

    return res.status(200).json({
      success: true,
      clients: users.filter((u) => u.type === USER_TYPES.client),
      freelancers: users.filter((u) => u.type === USER_TYPES.freelancer),
    })
  } catch (e) {
    console.log(e)
    return res.status(503).json({ success: false })
  }
})

AdminRouter.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find()

    return res.status(200).json({ success: true, projects })
  } catch (e) {
    console.log(e)
    return res.status(503).json({ success: false })
  }
})

AdminRouter.get('/client', async (req, res) => {
  const { id } = req.query

  try {
    const client = await User.findOne({ _id: id })

    return res.status(200).json({
      success: true,
      client,
    })
  } catch (e) {
    console.log(e)
    res.status(503).json({ success: false, message: 'Could not get client' })
  }
})

AdminRouter.get('/client', async (req, res) => {
  const { id } = req.query

  try {
    const projects = await User.find({ clientId: id })

    return res.status(200).json({
      success: true,
      projects,
    })
  } catch (e) {
    console.log(e)
    res.status(503).json({ success: false, message: 'Could not get projects' })
  }
})

AdminRouter.get('/freelancer', async (req, res) => {
  const { id } = req.query

  try {
    const freelancer = await User.findOne({ _id: id })
    const projects = await Project.find({
      freelancerId: id,
      status: PROJECT_STATUS.approved,
    })

    return res.status(200).json({
      success: true,
      freelancer: { ...freelancer._doc, completedProjects: projects.length },
    })
  } catch (e) {
    console.log(e)
    res
      .status(503)
      .json({ success: false, message: 'Could not get freelancer' })
  }
})

AdminRouter.post('/delete-client', async (req, res) => {
  const { id } = req.body
  try {
    await User.findOneAndUpdate({ _id: id }, { deleted: true })

    const projects = await Project.find({ clientId: id })

    await Promise.all(
      projects
        .filter(
          (p) =>
            p.status === PROJECT_STATUS.posted ||
            p.status === PROJECT_STATUS.inProgress
        )
        .map((p) => {
          return Project.findOneAndDelete({ _id: p.id })
        })
    )

    return res.status(202).json({ success: true })
  } catch (e) {
    console.log(e)
    return res.status(503).json({ success: false })
  }
})

AdminRouter.post('/delete-freelancer', async (req, res) => {
  const { id } = req.body
  try {
    await User.findOneAndUpdate({ _id: id }, { deleted: true })

    const projects = await Project.find({ freelancerId: id })

    await Promise.all(
      projects
        .filter((p) => p.status === PROJECT_STATUS.inProgress)
        .map((p) => {
          return Project.findOneAndUpdate(
            { _id: p.id },
            {
              status: PROJECT_STATUS.posted,
              accepted_at: null,
              accepted_bid: null,
              freelancerId: null,
            }
          )
        })
    )

    return res.status(202).json({ success: true })
  } catch (e) {
    console.log(e)
    return res.status(503).json({ success: false })
  }
})

AdminRouter.post('/delete-project', async (req, res) => {
  const { id } = req.body
  try {
    await Project.findOneAndDelete({ _id: id })

    return res.status(202).json({ success: true })
  } catch (e) {
    console.log(e)
    return res.status(503).json({ success: false })
  }
})

export default AdminRouter
