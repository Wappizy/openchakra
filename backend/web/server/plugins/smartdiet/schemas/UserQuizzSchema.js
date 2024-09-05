const { QUIZZ_TYPE, SURVEY_ANSWER } = require('../consts')
const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const UserQuizzSchema = new Schema({
  // Reference quizz
  quizz: {
    type: Schema.Types.ObjectId,
    ref: 'quizz',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  type: {
    type: String,
    enum: Object.keys(QUIZZ_TYPE),
    required: [true, 'Le type est obligatoire'],
  },
  key: {
    type: Schema.Types.ObjectId,
    ref: 'key',
    //required: [true, 'La clé est obligatoire'],
    required: false,
  },
  questions: [{
    type: Schema.Types.ObjectId,
    ref: 'userQuizzQuestion',
    required: true,
  }],
  coaching: {
    type: Schema.Types.ObjectId,
    index: true,
    ref: 'coaching',
    required: false,
  },
  // For progress quizz, migration_id is the same as the appointment migration_id
  migration_id: {
    type: Number,
    index: true,
  }
}, schemaOptions)

module.exports = UserQuizzSchema
