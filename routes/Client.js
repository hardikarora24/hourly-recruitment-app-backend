import connection from '../config/MongooseConfig.js'
import { PROJECT_STATUS, Project } from '../schema/Project.js'
import { Bid } from '../schema/Bid.js'

import express from 'express'

const ClientRouter = express.Router()

ClientRouter.get('/projects', async (req, res) => {
  const id = req.user._id

  try {
    const projects = await Project.find({ clientId: id })

    if (!projects) {
      throw new Error('Could not get projects from DB')
    }

    if (projects.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'No projects for this client' })
    }

    return res.status(200).json({ success: true, projects })
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, message: 'Could not get projects' })
  }
})

ClientRouter.post('/add-project', async (req, res) => {
  try {
    const newProject = Project({
      ...req.body.project,
      clientId: req.user._id.toString(),
    })

    const savedProject = await newProject.save()

    return res.status(201).json({ success: true, newProject: savedProject })
  } catch (e) {
    console.error(e)
    return res.status(503).json({ success: false })
  }
})

ClientRouter.get('/bids', async (req, res) => {
  const id = req.user._id
  const { projectId } = req.query

  try {
    const bids = await Bid.find({ clientId: id, projectId: projectId })

    if (!bids) {
      throw new Error('Could not get bids from DB')
    }

    if (bids.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'No bids for this project' })
    }

    return res.status(200).json({ success: true, bids })
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, message: 'Could not get bids' })
  }
})

ClientRouter.post('/accept-bid', async (req, res) => {
  const session = await connection.startSession()
  try {
    const { bidId, projectId } = req.body

    session.startTransaction()
    const bid = await Bid.findOneAndUpdate(
      { _id: bidId },
      { accepted_at: Date.now() },
      { session }
    )
    const project = await Project.findOneAndUpdate(
      { _id: projectId },
      {
        status: PROJECT_STATUS.inProgress,
        accepted_bid: { ...bid, accepted_at: Date.now() },
      },
      { session }
    )

    await session.commitTransaction()

    return res.status(201).json({ success: true })
  } catch (e) {
    console.log(e)
    return res
      .status(503)
      .json({ success: false, message: 'Could not accept bid' })
  }
})

export default ClientRouter
