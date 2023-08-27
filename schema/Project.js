import mongoose from 'mongoose'
import { BidSchema } from './Bid.js'

const PROJECT_STATUS = {
  posted: 'Posted',
  inProgress: 'In Progress',
  completed: 'Completed',
  approved: 'Approved',
}

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: { type: [String], required: true },
  duration: { type: Number, required: true },
  status: {
    type: [
      PROJECT_STATUS.approved,
      PROJECT_STATUS.completed,
      PROJECT_STATUS.inProgress,
      PROJECT_STATUS.posted,
    ],
    required: true,
    default: PROJECT_STATUS.posted,
  },
  bids: { type: [BidSchema], required: true },
  accepted_bid: { type: BidSchema, required: true, default: null },
})

const Project = mongoose.model('Project', ProjectSchema)

export { Project, PROJECT_STATUS, ProjectSchema }
