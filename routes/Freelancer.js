import express from 'express'
import { PROJECT_STATUS, Project } from '../schema/Project.js'
import { Bid } from '../schema/Bid.js'

const FreelancerRouter = express.Router()

FreelancerRouter.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({ status: PROJECT_STATUS.posted })

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

export default FreelancerRouter
