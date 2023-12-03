import mongoose from 'mongoose'

const SUBMISSION_STATUS = {
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
}

const SubmissionSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  sourceCodeUrl: { type: String, required: true },
  demoUrl: { type: String, required: true },
  hostedUrl: { type: String, required: true },
  accepted_at: { type: Date, required: false },
  status: {
    type: String,
    enum: [
      SUBMISSION_STATUS.submitted,
      SUBMISSION_STATUS.approved,
      SUBMISSION_STATUS.rejected,
    ],
    required: true,
    default: SUBMISSION_STATUS.submitted,
  },
  created_at: { required: true, type: Date },
})

const Submission = mongoose.model('Submission', SubmissionSchema)

export { Submission, SubmissionSchema, SUBMISSION_STATUS }
