import express from 'express'
import { PROJECT_STATUS, Project } from '../schema/Project.js'
import { Bid } from '../schema/Bid.js'
import { Submission } from '../schema/Submission.js'
import connection from '../config/MongooseConfig.js'
import businessHours from '../utils/businessHours.js'

const FreelancerRouter = express.Router()

FreelancerRouter.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ freelancerId: req.user._id }, { status: PROJECT_STATUS.posted }],
    })

    if (!projects) {
      throw new Error('Could not get projects from DB')
    }

    return res.status(200).json({ success: true, projects })
  } catch (err) {
    console.log(err)
    return res
      .status(503)
      .json({ success: false, message: 'Could not get projects' })
  }
})

FreelancerRouter.post('/bid', async (req, res) => {
  try {
    const bid = Bid({
      clientId: req.body.clientId,
      projectId: req.body.projectId,
      freelancerId: req.user._id,
      hourly_rate: req.body.rate,
    })

    const postedBid = await bid.save()

    return res.status(201).json({ success: true, bid: postedBid })
  } catch (e) {
    console.log(e)
    return res
      .status(503)
      .json({ success: false, message: 'Could not post bid' })
  }
})

FreelancerRouter.post('/submit', async (req, res) => {
  const session = await connection.startSession()
  try {
    session.startTransaction()
    await Submission.create(
      [
        {
          ...req.body.submission,
          freelancerId: req.user._id,
          clientId: req.body.clientId,
        },
      ],
      {
        session,
      }
    )
    await Project.findOneAndUpdate(
      { _id: req.body.submission.projectId },
      { status: PROJECT_STATUS.completed },
      { session }
    )
    await session.commitTransaction()
    await session.endSession()

    return res.status(201).json({ success: true })
  } catch (e) {
    console.log(e)
    return res
      .status(503)
      .json({ success: false, message: 'Could not submit project' })
  }
})

FreelancerRouter.get('/earnings', async (req, res) => {
  try {
    const id = req.user._id

    const projects = await Project.find({
      freelancerId: id,
      status: PROJECT_STATUS.approved,
    })

    console.log(projects)

    const earnings = projects.reduce((total, p) => {
      return (
        total +
        p.accepted_bid.hourly_rate *
          businessHours(
            p.accepted_bid.accepted_at,
            p.approved_submission.accepted_at
          )
      )
    }, 0)

    return res.status(200).json({ success: true, earnings })
  } catch (e) {
    console.log(e)
    return res
      .status(503)
      .json({ success: false, message: 'Could  not get total earnings' })
  }
})

export default FreelancerRouter
