const moment = require('moment')
const mongoose = require('mongoose')
const lodash=require('lodash')
const formatDuration = require('format-duration')
const {cloneModel, cloneArray} = require('../../utils/database')

const Schema = mongoose.Schema

const SessionSchema = new Schema({
  name: {
    type: String,
    required: false,
  },
  code: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  start: {
    type: Date,
    required: false,
  },
  end: {
    type: Date,
    required: false,
  },
  program: {
    type: Schema.Types.ObjectId,
    ref: 'program',
    required: false,
  },
  themes: [{
    type: Schema.Types.ObjectId,
    ref: 'theme',
    required: true,
  }],
  location: {
    type: Schema.Types.ObjectId,
    ref: 'trainingCenter',
    required: false,
  },
  trainers: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  }],
  trainees: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: false,
  }],
  trainee: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: false,
  },
  origin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'resource',
    default: null,
  },
},
{toJSON: {virtuals: true, getters: true},
})

SessionSchema.virtual('trainees_count').get(function() {
  return this.trainees?.length || 0
})

SessionSchema.virtual('trainers_count').get(function() {
  return this.trainers?.length || 0
})

SessionSchema.virtual('status').get(function() {
  return moment()>this.end_date ? 'Terminée': 'En cours'
})

SessionSchema.methods.updateThemes = function(themes) {
  return cloneArray({data: themes})
    .then(clonedThemes => {
      this.themes=clonedThemes
      return this.save()
    })
}

SessionSchema.pre(['save'], function() {
  if (this.isModified('program') && this.program && !this.origin) {
    console.log('program is modified')
    return mongoose.connection.models.program.findById(this.program._id).populate({path: 'themes', populate: 'resources'})
      .then(program => {
        return cloneArray({data: program.themes})
          .then(themes => {
            this.themes=themes
            return mongoose.connection.models.session
              .find({origin: this._id})
              .then(sessions => {
                return Promise.all(sessions.map(s => s.updateThemes(program.themes)))
              })
          })
      })
  }
})

SessionSchema.virtual('spent_time').get(function() {
  return lodash.sum(this.themes.map(t => t.spent_time || 0))
})

SessionSchema.virtual('spent_time_str').get(function() {
  const timeMillis=lodash.sum(this.themes.map(t => t.spent_time || 0))
  return formatDuration(timeMillis, {leading: true})
})

SessionSchema.methods.addChild = function(model, data) {
  return cloneModel({data})
    .then(cloned => {
      this.themes.push(cloned)
      return this.save()
    })
    .then(() => {
      // Session formateur => envoyer sur sessions apprenants
      if (!this.origin) {
        return mongoose.connection.models.session.find({origin: this._id})
          .then(subs => {
            return subs.map(s => { console.log(`sub child`); return s.addChild(model, data) })
          })
      }
    })
}

SessionSchema.virtual('contact_name').get(function() {
  return `Session ${this.name}`
})

module.exports = SessionSchema
