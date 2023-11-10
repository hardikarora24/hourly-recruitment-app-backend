import mongoose from 'mongoose'

const USER_TYPES = {
  admin: 'Admin',
  client: 'Client',
  freelancer: 'Freelancer',
}

const Userschema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  type: {
    type: String,
    enum: [USER_TYPES.admin, USER_TYPES.client, USER_TYPES.freelancer],
    required: true,
  },
  username: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, required: true },
  skills: { type: [String], required: true, default: [] },
})

const User = mongoose.model('User', Userschema)

export { User, USER_TYPES }
