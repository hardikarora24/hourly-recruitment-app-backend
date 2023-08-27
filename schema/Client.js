import mongoose from 'mongoose'
import { ProjectSchema } from './Project.js'

const ClientSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  projects: { type: [ProjectSchema], required: true },
})

const Client = mongoose.model('Client', ClientSchema)

export { Client }
