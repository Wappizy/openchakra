const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {CESU} = require('../../utils/consts')
const {hideIllegal} = require('../../utils/text')

const ShopSchema = new Schema({
  booking_request: {
    type: Boolean,
    default: false,
  },
  no_booking_request: {
    type: Boolean,
    default: false,
  },
  my_alfred_conditions: {
    type: Boolean,
    default: false,
  },
  profile_picture: {
    type: Boolean,
    default: false,
  },
  identity_card: {
    type: Boolean,
    default: false,
  },
  recommandations: {
    type: Boolean,
    default: false,
  },
  welcome_message: {
    type: String,
    set: text => hideIllegal(text),
  },
  flexible_cancel: {
    type: Boolean,
    default: false,
  },
  moderate_cancel: {
    type: Boolean,
    default: false,
  },
  strict_cancel: {
    type: Boolean,
    default: false,
  },
  verified_phone: {
    type: Boolean,
    default: false,
  },
  is_particular: {
    type: Boolean,
  },
  is_professional: {
    type: Boolean,
  },
  company: {
    name: {
      type: String,
    },
    siret: {
      type: String,
    },
    vat_subject: {
      type: Boolean,
      default: false,
    },
    vat_number: {
      type: String,
    },
  },
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'ServiceUser',

  }],
  alfred: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  picture: String,
  // particulier CESU : oblige, accepte, refuse
  cesu: {
    type: String,
    enum: [...CESU, null],
    default: 'Disabled',
  },
  // Eligible au crédit impôt service
  cis: {
    type: Boolean,
    default: false,
  },
  creation_date: {
    type: Date,
    default: Date.now,
  },
  // Mangopay as seller
  id_mangopay: {
    type: String,
  },
})

module.exports = ShopSchema
