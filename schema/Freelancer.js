import mongoose from 'mongoose'

const FreelancerSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  active_projects: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    default: [],
  },
  total_earnings: { type: Number, required: true, default: 0 },
  active_bids: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    default: [],
  },
})

const Freelancer = mongoose.model('Freelancer', FreelancerSchema)

export { Freelancer }
