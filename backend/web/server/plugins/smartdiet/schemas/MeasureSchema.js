const { MAX_WEIGHT, MIN_WEIGHT } = require('../consts')
const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const MeasureSchema = new Schema({
  date: {
    type: Date,
    default: () => Date.now(),
    required: [true, 'La date est obligatoire']
  },
  chest: {
    type: Number,
    required: false,
  },
  waist: {
    type: Number,
    required: false,
  },
  hips: {
    type: Number,
    required: false,
  },
  thighs: {
    type: Number,
    required: false,
  },
  arms: {
    type: Number,
    required: false,
  },
  weight: {
    type: Number,
    min: [MIN_WEIGHT, `Poids attendu entre ${MIN_WEIGHT} et ${MAX_WEIGHT} kg`],
    max: [MAX_WEIGHT, `Poids attendu entre ${MIN_WEIGHT} et ${MAX_WEIGHT} kg`],
    required: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    index: true,
    required: [true, `Le patient est obligatoire`],
  },
  migration_id: {
    type: Number,
    index: true,
    required: false,
  },
}, schemaOptions)

module.exports = MeasureSchema
