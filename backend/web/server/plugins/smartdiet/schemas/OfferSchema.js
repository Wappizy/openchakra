const { SystemError } = require('../../../utils/errors')
const {
  ARTICLE,
  CONTENTS_ARTICLE,
  CONTENTS_INFOGRAPHY,
  CONTENTS_PODCAST,
  CONTENTS_VIDEO,
  EVENT_COLL_CHALLENGE,
  EVENT_IND_CHALLENGE,
  EVENT_MENU,
  EVENT_WEBINAR,
  INFOGRAPHY,
  PODCAST,
  VIDEO
} = require('../consts')
const mongoose = require('mongoose')
const bcrypt=require('bcryptjs')
const {schemaOptions} = require('../../../utils/schemas')
const util=require('util')

const Schema = mongoose.Schema

const OfferSchema = new Schema({
  name: {
    type: String,
    set: v => v?.trim(),
    required: [true, 'Le nom est obligatoire'],
  },
  price: {
    type: Number,
    required: [true, 'Le prix est obligatoire'],
  },
  duration: { // In days
    type: Number,
    min: [0, 'La durée ne peut être négative'],
    required: [true, 'La durée est obligatoire'],
  },
  webinars_credit: {
    type: Number,
    default: 0,
    required: [function() {return !this?.webinars_unlimited}, 'Le crédit de webinars est obligatoire'],
  },
  webinars_unlimited: {
    type: Boolean,
    default: false,
    required: true,
  },
  infographies_credit: {
    type: Number,
    default: 0,
    required: [function() {return !this?.infographies_unlimited}, `Le crédit d'infographies est obligatoire`],
  },
  infographies_unlimited: {
    type: Boolean,
    default: false,
    required: true,
  },
  articles_credit: {
    type: Number,
    default: 0,
    required: [function() {return !this?.articles_unlimited}, 'Le crédit d\'articles est obligatoire'],
  },
  articles_unlimited: {
    type: Boolean,
    default: false,
    required: true,
  },
  podcasts_credit: {
    type: Number,
    default: 0,
    required: [function() {return !this?.podcasts_unlimited}, 'Le crédit de podcasts est obligatoire'],
  },
  podcasts_unlimited: {
    type: Boolean,
    default: false,
    required: true,
  },
  video_credit: {
    type: Number,
    default: 0,
    required: [function() {return !this?.video_unlimited}, 'Le crédit de vidéos est obligatoire'],
  },
  video_unlimited: {
    type: Boolean,
    default: false,
    required: true,
  },
  collective_challenge_available: {
    default: false,
    type: Boolean,
  },
  individual_challenge_available: {
    default: false,
    type: Boolean,
  },
  online_coaching_available: {
    default: false,
    type: Boolean,
  },
  coaching_credit: {
    type: Number,
    default: 0,
    required: [true, 'Le crédit de coachings est obligatoire'],
  },
  nutrition_credit: {
    type: Number,
    default: 0,
    required: [true, 'Le crédit de conseils nutritionels est obligatoire'],
  },
  hotdiet_available: {
    default: false,
    type: Boolean,
  },
  groups_credit: {
    type: Number,
    default: 0,
    required: [function() {return !this?.groups_unlimited}, 'Le crédit de groupes est obligatoire'],
  },
  groups_unlimited: {
    type: Boolean,
    default: false,
    required: true,
  },
  operations_credit: {
    type: Number,
    default : 0,
    required: true,
  },
  impact: {
    type: Boolean,
    default: false,
    required: [true, `La possibilité d'étude d'impact doit être renseignée`]
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: false,
  },
  validity_start: {
    type: Date,
    required: [function(){return !!this?.company},  `La date de début de validité est obligatoire`],
  },
  // validity_end: {
  //   type: Date,
  //   required: [function(){return !!this?.company},  `La date de fin de validité est obligatoire`],
  // },
  assessment_quizz: {
    type: Schema.Types.ObjectId,
    ref: 'quizz',
    required: [function(){return !!this?.company && !this?.migration_id},  `Le modèle de quizz bilan est obligatoire`],
  },
  impact_quizz: {
    type: Schema.Types.ObjectId,
    ref: 'quizz',
    required: [function(){return !!this?.company && !!this?.impact},  `Le modèle de quizz d'impact est obligatoire`],
  },
  // Migration id : company smart id * 1000 + smart program type
  migration_id: {
    type: Number,
    index: true,
  },
}, schemaOptions)

OfferSchema.methods.getContentLimit=function(type){
  const TYPE_2_ATTRIBUTE={
    [CONTENTS_ARTICLE]:'articles',
    [CONTENTS_INFOGRAPHY]:'infographies',
    [CONTENTS_VIDEO]:'video',
    [CONTENTS_PODCAST]:'podcasts',
  }
  const att=TYPE_2_ATTRIBUTE[type]
  const limit=this[`${att}_unlimited`]? Number.MAX_VALUE : this[`${att}_credit`]
  return limit
}

OfferSchema.methods.getEventLimit=function(type){
  switch (type) {
    case EVENT_WEBINAR: return this.webinars_unlimited ? Number.MAX_VALUE : this.webinars_credit
    case EVENT_COLL_CHALLENGE: return this.collective_challenge_available ? Number.MAX_VALUE : 0
    case EVENT_IND_CHALLENGE: return this.individual_challenge_available ? Number.MAX_VALUE : 0
    case EVENT_MENU: return Number.MAX_VALUE
  }
  throw new SystemError(`Offer can't get event limit for type ${type}`)
}

module.exports = OfferSchema
