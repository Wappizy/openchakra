const {REVIEW_STATUS} = require('../../../utils/consts')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const mongooseLeanVirtuals = require('mongoose-lean-virtuals')

const ReviewSchema = new Schema({
  content: {
    type: String,
  },
  note_alfred: {
    prestation_quality: {
      type: Number,
      max: 5,
      min: 0,
    },
    quality_price: {
      type: Number,
      max: 5,
      min: 0,
    },
    relational: {
      type: Number,
      max: 5,
      min: 0,
    },
    global: {
      type: Number,
      max: 5,
      min: 0,
    },
    careful: { // Travail soigné
      type: Boolean,
    },
    punctual: { // Ponctuel
      type: Boolean,
    },
    flexible: {
      type: Boolean,
    },
    reactive: { // Réactif
      type: Boolean,
    },
  },
  note_client: {
    reception: {
      type: Number,
      max: 5,
      min: 0,
    },
    accuracy: {
      type: Number,
      max: 5,
      min: 0,
    },
    relational: {
      type: Number,
      max: 5,
      min: 0,
    },
    global: {
      type: Number,
      max: 5,
      min: 0,
    },
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  serviceUser: {
    type: Schema.Types.ObjectId,
    ref: 'serviceUser',
  },
  alfred: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  status: {
    type: String,
    enum: Object.values(REVIEW_STATUS),
    default: REVIEW_STATUS.NOT_MODERATED,
    required: true,
  },
})

ReviewSchema.plugin(mongooseLeanVirtuals)

module.exports = ReviewSchema
