const {
  declareVirtualField, setPreCreateData, declareEnumField,
} = require('../../utils/database')
const { RESOURCE_TYPE, PROGRAM_STATUS, ROLES } = require('./consts')

const MODELS=['block', 'program', 'module', 'sequence', 'resource']

MODELS.forEach(model => {
  declareVirtualField({model, field: 'duration', instance: 'Number'})
  declareVirtualField({model, field: 'order', instance: 'Number'})
  declareVirtualField({model, field: 'duration_str', instance: 'String'})
  declareVirtualField({model, field: 'children_count', instance: 'Number'})
  declareVirtualField({model, field: 'resource_type', instance: 'String', enumValues: RESOURCE_TYPE})
  declareVirtualField({model, field: 'evaluation', instance: 'Boolean'})
})

declareVirtualField({model:'program', field: 'status', instance: 'String', enumValues: PROGRAM_STATUS})

USER_MODELS=['user', 'loggedUser']
USER_MODELS.forEach(model => {
  declareVirtualField({model, field: 'role', instance: 'String', enumValues: ROLES})
})

const preCreate = ({model, params, user}) => {
  if (['resource'].includes(model)) {
    params.creator=params?.creator || user
  }
  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)
