import mongoose from 'mongoose'

const Bidschema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, required: true },
  hourly_rate: { type: Number, required: true },
  accepted_at: { type: Date, required: false },
})

const Bid = mongoose.model('Bid', Bidschema)

export { Bid, Bidschema }
