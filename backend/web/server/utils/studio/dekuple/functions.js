const {GENDER, MEASURE_TYPE} = require('../../../../utils/dekuple/consts')
const {declareEnumField, declareVirtualField} = require('../../database')

const USER_MODELS=['user', 'loggedUser']
USER_MODELS.forEach(m => {
  declareEnumField({model: m, field: 'gender', enumValues: GENDER})
  declareVirtualField({model: m, field: 'measures', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'measure'}}})
  declareVirtualField({model: m, field: 'appointments', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'appointment'}}})
  declareVirtualField({model: m, field: 'reminders', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'reminder'}}})
})

declareEnumField({model: 'measure', field: 'type', enumValues: MEASURE_TYPE})
