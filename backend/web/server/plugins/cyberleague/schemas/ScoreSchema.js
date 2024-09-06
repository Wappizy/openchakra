const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { ANSWER_NO, ANSWERS } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const ScoreSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur du score est obligatoire`],
  },
  answers: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'answer',
      required: true,
    }],
    default: []
  },
  global_rate: {
    type: Number,
    default: false
  },
  category_rates: {
    type: [{
      question_category: {
        type: Schema.Types.ObjectId,
        ref: 'questionCategory',
        required: true
      },
      category_rate: {
        type: Number,
        required: true
      }
    }],
    default: []
  },
  bellwether_rates: {
    type: [{
      question_category: {
        type: Schema.Types.ObjectId,
        ref: 'questionCategory',
        required: true
      },
      category_rate: {
        type: Number,
        required: true
      }
    }],
    default: []
  }
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

ScoreSchema.virtual('deviation', DUMMY_REF).get(function() {
  return this?.answers?.filter(a => a.answer==ANSWER_NO).length || 0
})

/* eslint-enable prefer-arrow-callback */

module.exports = ScoreSchema