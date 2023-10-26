import mongoose from 'mongoose'
import { Projectschema } from './Project.js'

const Clientschema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  projects: { type: [Projectschema], required: true },
})

const Client = mongoose.model('Client', Clientschema)

export { Client }
