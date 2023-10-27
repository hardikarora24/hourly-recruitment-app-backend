import mongoose from 'mongoose'

const SubmissionSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  sourceCodeUrl: { type: String, required: true },
  demoUrl: { type: String, required: true },
  hostedUrl: { type: String, required: true },
  accepted_at: { type: Date, required: false },
})

const Submission = mongoose.model('Submission', SubmissionSchema)

export { Submission, SubmissionSchema }
