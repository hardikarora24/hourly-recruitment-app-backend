import express from 'express'
import { PROJECT_STATUS, Project } from '../schema/Project.js'
import { Bid } from '../schema/Bid.js'
import { Submission } from '../schema/Submission.js'
import connection from '../config/MongooseConfig.js'
import businessHours from '../utils/businessHours.js'
import { User } from '../schema/User.js'

const FreelancerRouter = express.Router()

FreelancerRouter.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ freelancerId: req.query.id }, { status: PROJECT_STATUS.posted }],
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
      freelancerId: req.query.id,
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

FreelancerRouter.post('/delete-bid', async (req, res) => {
  try {
    await Bid.findOneAndDelete({ _id: req.body.id })

    return res.status(204).json({ success: true })
  } catch (e) {
    console.log(e)
    return res
      .status(503)
      .json({ success: false, message: 'Could not delete bid' })
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
          freelancerId: req.body.id,
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
    const id = req.query._id

    const projects = await Project.find({
      freelancerId: id,
      status: PROJECT_STATUS.approved,
    })

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

FreelancerRouter.post('/delete', async (req, res) => {
  const id = req.body.bid_id

  try {
    await Bid.findOneAndDelete({ _id: id })

    return res.status(204).json({ success: true })
  } catch (e) {
    console.log(e)
    res.status(503).json({ success: false, message: 'Could not delete' })
  }
})

FreelancerRouter.get('/bids', async (req, res) => {
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

FreelancerRouter.post('/add-skill', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.body.id },
      { $push: { skills: req.body.skill } },
      { new: true }
    )

    return res.status(200).json({ success: true, skills: user.skills })
  } catch (e) {
    console.log(e)
    return res
      .status(503)
      .json({ success: false, message: 'Could not add skill' })
  }
})

FreelancerRouter.post('/delete-skill', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.body.id },
      { skills: req.body.skills },
      { new: true }
    )

    return res.status(200).json({ success: true, skills: user.skills })
  } catch (e) {
    console.log(e)
    return res
      .status(503)
      .json({ success: false, message: 'Could not delete skill' })
  }
})

FreelancerRouter.get('/submission', async (req, res) => {
  const { id, projectId } = req.query
  try {
    const submission = await Submission.find({
      freelancerId: id,
      projectId,
    })

    if (!submission) {
      throw new Error('Could not get projects from DB')
    }

    return res.status(200).json({ success: true, submission })
  } catch (err) {
    console.log(err)
    return res
      .status(503)
      .json({ success: false, message: 'Could not get projects' })
  }
})

export default FreelancerRouter
