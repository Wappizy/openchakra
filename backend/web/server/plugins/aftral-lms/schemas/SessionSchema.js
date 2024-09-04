const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR}=require('../consts')

const SessionSchema = new Schema({
  start_date: {
    type: Date,
    required: [true, `La date de début est obligatoire`],
  },
  end_date: {
    type: Date,
    required: [true, `La date de fin est obligatoire`],
  },
  location: {
    type: String,
    required: false,
  },
  trainers: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
    }],
    required: true,
    default: [],
  },
  trainees: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
    }],
    required: true,
    default: [],
  },
  // AFTRAL session id
  aftral_id: {
    type: String,
    required: false,
  },
  conversations: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'sessionConversation',
    }],
    required: true,
    default: [],
  },
  // Computed
  evaluation_resources: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: `block`,
    }],
    required: true,
    default: []
  }
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

module.exports = SessionSchema
