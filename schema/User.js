import mongoose from 'mongoose'

const USER_TYPES = {
  admin: 'Admin',
  client: 'Client',
  freelancer: 'Freelancer',
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: [USER_TYPES.admin, USER_TYPES.client, USER_TYPES.freelancer],
    required: true,
  },
  username: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, required: true },
})

const User = mongoose.model('User', UserSchema)

export { User, USER_TYPES }
