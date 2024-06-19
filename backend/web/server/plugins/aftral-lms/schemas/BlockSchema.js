const mongoose = require('mongoose')
const moment = require('moment')
const lodash=require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, BLOCK_STATUS, BLOCK_STATUS_TO_COME, RESOURCE_TYPE, BLOCK_STATUS_FINISHED, BLOCK_STATUS_CURRENT}=require('../consts')
const { formatDuration, convertDuration } = require('../../../../utils/text')
const { THUMBNAILS_DIR } = require('../../../../utils/consts')
const { childSchemas } = require('./ResourceSchema')
const { DUMMY_REF } = require('../../../utils/database')

function getterTemplateFirst(attribute) {
  function getter(v) {
    if (!this.origin) {
      return v
    }
    return this.origin?.[attribute]
  }
  return getter
}

function getterMeFirst(attribute) {
  function getter(v) {
    if (lodash.isNil(v)) {
      return this.origin?.[attribute]
    }
    return v
  }
  return getter
}

function setterTemplateOnly(attribute) {
  function setter(v) {
    if (!this.origin) {
      return v
    }
    throw new Error(`Setting ${attribute} forbidden`)
  }
  return setter
}

const BlockSchema = new Schema({
  name: {
    type: String,
    required: [function()  {return !this.origin}, `Le nom est obligatoire`],
    index: true,
    unique: true,
    get: getterTemplateFirst('name'),
    set: setterTemplateOnly('name')
  },
  code: {
    type: String,
    required: false,
    get: getterTemplateFirst('code'),
    set: setterTemplateOnly('code')
  },
  description: {
    type: String,
    required: false,
    get: getterTemplateFirst('description'),
    set: setterTemplateOnly('description')
  },
  picture: {
    type: String,
    required: false,
    get: getterTemplateFirst('picture'),
    set: setterTemplateOnly('picture')
  },
  actual_children: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'block',
      required:[true, `L'enfant est obligatoire`],
    }],
    required: true,
    default: [],
  },
  // Closed: must finish children in order
  closed: {
    type: Boolean,
    default: function() { return !this.origin ? false : null},
    required:[function() { return !this.origin}, `L'état fermé (O/N) est obligatoire`],
    get: getterMeFirst('closed'),
  },
  masked: {
    type: Boolean,
    default: function() { return !this.origin ? false : null},
    required:[function() {return  !this.origin}, `L'état masqué est obligatoire`],
    get: getterMeFirst('masked'),
  },
  optional: {
    type: Boolean,
    default: function() { return !this.origin ? false : null},
    required:[function() {return  !this.origin}, `L'état optionnel est obligatoire`],
    get: getterMeFirst('masked'),
  },
  origin: {
    type: Schema.Types.ObjectId,
    ref: 'block',
    required:false,
  },
  // TODO Compute actual status
  achievement_status: {
    type: String,
    enum: Object.keys(BLOCK_STATUS),
  },
  achievement_rule: {
    type: String,
  },
  url: {
    type: String,
    required: [function() {return this.type=='resource' && !this.origin}, `L'url est obligatoire`],
    get: getterTemplateFirst('url'),
  },
  resource_type: {
    type: String,
    enum: Object.keys(RESOURCE_TYPE),
    required: [function(){ return this.type=='resource' && !this.origin}, `Le type de ressource est obligatoire`],
    get: getterTemplateFirst('resource_type'),
  },
  spent_time: {
    type: Number,
  },
  spent_time_str: {
    type: String,
  },
  resources_count: {
    type: Number,
  },
  finished_resources_count: {
    type: Number,
  },
  resources_progress: {
    type: Number,
  },
  _locked: {
    type: Boolean,
    default: false,
    required: [true, `Le status verrouillagee est obligatoire`]
  },
  session: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'block',
    }],
    required: true,
    default: [],
  },
  // Annotation set by trainee
  annotation: {
    type: String,
  },
  access_condition: {
    type: Boolean,
    set: function(v) {
      if (!this.origin) {
        throw new Error(`La condition d'accès n'est possible que si ce bloc a un parent`)
      }
      return v
    }
  },
  // Annotation set by trainee
  success_message: {
    type: String,
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

BlockSchema.virtual('is_template', DUMMY_REF).get(function() {
  return !this.origin
})

BlockSchema.virtual('order', DUMMY_REF).get(function() {
  return 0
})

BlockSchema.virtual('children_count', DUMMY_REF).get(function() {
  return this.children?.length || 0
})

BlockSchema.virtual('evaluation', DUMMY_REF).get(function() {
  return this._evaluation
})

BlockSchema.virtual('evaluation', DUMMY_REF).set(function(value) {
})

BlockSchema.virtual('children', {localField: 'tagada', foreignField: 'tagada'}).get(function() {
  return this.origin ? this.origin.children : this.actual_children
})

BlockSchema.virtual('search_text', {localField: 'tagada', foreignField: 'tagada'}).get(function() {
  return `${this.name} ${this.code}`
})

// BlockSchema.index(
//   { name: 1},
//   { unique: true, message: 'Un bkoc de même nom existe déjà' });

module.exports = BlockSchema
