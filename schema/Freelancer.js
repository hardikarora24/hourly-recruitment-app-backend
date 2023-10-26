import mongoose from 'mongoose'

const Freelancerschema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  total_earnings: { type: Number, required: true, default: 0 },
})

const Freelancer = mongoose.model('Freelancer', Freelancerschema)

export { Freelancer }
