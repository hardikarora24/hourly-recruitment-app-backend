import mongoose from 'mongoose'
import { Bidschema } from './Bid.js'
import { SubmissionSchema } from './Submission.js'

const PROJECT_STATUS = {
  posted: 'Posted',
  inProgress: 'In Progress',
  completed: 'Completed',
  approved: 'Approved',
}

const Projectschema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: { type: [String], required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  duration: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      PROJECT_STATUS.approved,
      PROJECT_STATUS.completed,
      PROJECT_STATUS.inProgress,
      PROJECT_STATUS.posted,
    ],
    required: true,
    default: PROJECT_STATUS.posted,
  },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, required: false },
  accepted_bid: { type: Bidschema, required: false, default: null },
  approved_submission: {
    type: SubmissionSchema,
    required: false,
    default: null,
  },
  submission_url: { type: String, required: false },
})

const Project = mongoose.model('Project', Projectschema)

export { Project, PROJECT_STATUS, Projectschema }
