import connection from '../config/MongooseConfig.js'
import { PROJECT_STATUS, Project } from '../schema/Project.js'
import { Bid } from '../schema/Bid.js'

import express from 'express'
import { SUBMISSION_STATUS, Submission } from '../schema/Submission.js'
import { User } from '../schema/User.js'

const ClientRouter = express.Router()

ClientRouter.get('/projects', async (req, res) => {
  const id = req.query.id

  try {
    const projects = await Project.find({ clientId: id })

    if (!projects) {
      throw new Error('Could not get projects from DB')
    }

    if (projects.length === 0) {
      return res
        .status(404)
        .json({ success: true, message: 'No projects for this client' })
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
      clientId: req.body.id.toString(),
    })

    const savedProject = await newProject.save()

    return res.status(201).json({ success: true, newProject: savedProject })
  } catch (e) {
    console.error(e)
    return res.status(503).json({ success: false })
  }
})

ClientRouter.get('/bids', async (req, res) => {
  const { projectId } = req.query

  try {
    const bids = await Bid.find({ projectId: projectId })

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
    const { bidId, projectId, freelancerId } = req.body

    session.startTransaction()
    const bid = await Bid.findOneAndUpdate(
      { _id: bidId },
      { accepted_at: Date.now() },
      { session, new: true }
    )
    const project = await Project.findOneAndUpdate(
      { _id: projectId },
      {
        status: PROJECT_STATUS.inProgress,
        accepted_bid: bid,
        freelancerId,
      },
      { session, new: true }
    )

    await session.commitTransaction()
    await session.endSession()

    return res.status(201).json({ success: true })
  } catch (e) {
    console.log(e)
    return res
      .status(503)
      .json({ success: false, message: 'Could not accept bid' })
  }
})

ClientRouter.get('/submissions', async (req, res) => {
  const id = req.query.id

  try {
    const submissions = await Submission.find({ clientId: id })

    if (!submissions) {
      throw new Error('Could not get projects from DB')
    }

    if (submissions.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'No submissions for this client' })
    }

    return res.status(200).json({ success: true, submissions })
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, message: 'Could not get submissions' })
  }
})

ClientRouter.post('/approve', async (req, res) => {
  const session = await connection.startSession()
  try {
    const { projectId, submission } = req.body

    session.startTransaction()
    const s = await Submission.findOneAndUpdate(
      { _id: submission._id },
      { accepted_at: Date.now(), status: SUBMISSION_STATUS.approved },
      { session, new: true }
    )
    const project = await Project.findOneAndUpdate(
      { _id: projectId },
      {
        status: PROJECT_STATUS.approved,
        approved_submission: s,
      },
      { session, new: true }
    )

    await session.commitTransaction()
    await session.endSession()

    return res.status(201).json({ success: true })
  } catch (e) {
    console.log(e)
    return res
      .status(503)
      .json({ success: false, message: 'Could not approve submission' })
  }
})

ClientRouter.post('/reject', async (req, res) => {
  const session = await connection.startSession()
  try {
    const { projectId, submission } = req.body

    session.startTransaction()
    const s = await Submission.findOneAndUpdate(
      { _id: submission._id },
      { accepted_at: Date.now(), status: SUBMISSION_STATUS.rejected },
      { session, new: true }
    )
    const project = await Project.findOneAndUpdate(
      { _id: projectId },
      {
        status: PROJECT_STATUS.inProgress,
      },
      { session, new: true }
    )

    await session.commitTransaction()
    await session.endSession()

    return res.status(201).json({ success: true })
  } catch (e) {
    console.log(e)
    return res
      .status(503)
      .json({ success: false, message: 'Could not approve submission' })
  }
})

ClientRouter.post('/edit', async (req, res) => {
  const p = req.body.project

  try {
    if (p.status !== PROJECT_STATUS.posted) {
      return res
        .status(401)
        .json({ success: false, message: 'Cannot edit this post' })
    }

    await Project.findOneAndUpdate({ _id: p._id }, p)

    return res.status(201).json({ success: true, project: p })
  } catch (e) {
    console.log(e)
    res.status(503).json({ success: false, message: 'Could not edit' })
  }
})

ClientRouter.post('/delete', async (req, res) => {
  const id = req.body.project_id

  try {
    await Project.findOneAndDelete({ _id: id })

    return res.status(202).json({ success: true })
  } catch (e) {
    console.log(e)
    res.status(503).json({ success: false, message: 'Could not delete' })
  }
})

ClientRouter.get('/freelancer', async (req, res) => {
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

export default ClientRouter
