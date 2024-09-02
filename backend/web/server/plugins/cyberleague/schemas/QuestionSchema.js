const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const QuestionSchema = new Schema({
  text: {
    type: String,
    required: [true, `Le texte de la question est obligatoire`],
  },
  poids: {
    type: Number,
    validate: [function(s) {s => [1,2,3].includes(s)}, 'Le poids doit être 1, 2 ou 3'],
    required: [true, `Le poids de la question est obligatoire`],
  },
  question_category: {
    type: Schema.Types.ObjectId,
    ref: 'questionCategory',
    required: [true, `La catégorie de la question est obligatoire`]
  },
  is_bellwether: {
    type: Boolean,
    required: [true, `Il est obligatoire de préciser si la question appartient au baromètre`]
  }
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = QuestionSchema