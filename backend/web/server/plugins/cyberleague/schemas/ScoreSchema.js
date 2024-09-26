const mongoose = require('mongoose')
const lodash = require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const { ANSWER_NO, SCORE_LEVELS, QUESTION_CATEGORIES } = require('../consts')
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
  _category_rates: {
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
  },
  level: {
    type: String,
    enum: Object.keys(SCORE_LEVELS),
    required: [true, `Le niveau du score est obligatoire`]
  },
  questions_by_category: {
    type: [{
      category: {
        type: Schema.Types.ObjectId,
        ref: 'category'
      },
      answers: {
        type: [{
          type: Schema.Types.ObjectId,
          ref: 'answer'
        }]
      }
    }]
  },
  bellwether_count: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    required: true,
    default: false
  }
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

ScoreSchema.virtual('deviation', DUMMY_REF).get(function() {
  return this?.answers?.filter(a => a.answer==ANSWER_NO).length || 0
})

ScoreSchema.virtual('question_count',DUMMY_REF).get(function() {
  return this.answers?.length || 0
})

/* eslint-enable prefer-arrow-callback */

module.exports = ScoreSchema