const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const CommentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: [true, `Le rédacteur est obligatoire`],
    },
    text: {
      type: String,
      required: [true, 'Le commentaire est obligatoire'],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'post',
      required: false,
    },
  },
  schemaOptions,
)

module.exports = CommentSchema
