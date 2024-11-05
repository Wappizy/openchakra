const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const NotificationSchema = new Schema({
  _target: {
    type: Schema.Types.ObjectId,
    refPath: '_target_type',
    required: [true, `Il faut l'id de la cible de la notification`]
  },
  _target_type: {
    type: String,
    required: [true, `Le type de l'id de la target est obligatoire`]
  },
  _text: {
    type: String,
    required: [true, `Un texte est obligatoire pour une notification`]
  },
  recipients: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }]
  },
  seen_by_recipients: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }]
  },
  picture: {
    type: String,
    required: false
  },
  custom_props: {
    type: String,
    required: false
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = NotificationSchema
