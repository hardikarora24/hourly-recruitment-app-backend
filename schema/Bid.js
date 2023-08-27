import mongoose from 'mongoose'

const BidSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, required: true },
  hourly_rate: { type: Number, required: true },
  accepted_at: { type: Date, required: true },
})

const Bid = mongoose.model('Bid', BidSchema)

export { Bid, BidSchema }
