const mongoose=require('mongoose')
const moment=require('moment')
const lodash=require('lodash')
const { loadFromDb } = require('../../utils/database')
const { ROLE_FORMATEUR, ROLE_APPRENANT, VISIO_TYPE } = require('./consts')
const Group = require('../../models/Group')
const User = require('../../models/User')
const Session = require('../../models/Session')
const { formatDuration } = require('../../../utils/text')

const getGroupTrainees= async groupId => {
  const group=await mongoose.models.group.findById(groupId)
    .populate('sessions')
  return lodash(group.sessions).map(s => s.trainees.map(s => s._id)).uniq().flatten()
}
/**
 * Must return visios linked to the group (_owner==g)
 * plus coachings for this group's users
 */
const getGroupVisiosDays = async (userId, params, data, fields, actualLogged) => {
  const VISIOS_FILTER = /visios\./
  const VISIOS_FILTER2 = /\.visios/
  fields=fields.filter(f => VISIOS_FILTER.test(f)).map(f => f.replace(VISIOS_FILTER, ''))
  params=lodash(params)
    .pickBy((_, f) => VISIOS_FILTER2.test(f))
    .mapKeys((_, f) => f.replace(VISIOS_FILTER2, ''))
    .value()
  const trainees=await getGroupTrainees(data._id)
  params={'filter._owner': {$in: [data._id, ...trainees]}}
  const role=(await User.findById(userId)).role
  const visios=await loadFromDb({model: 'visio', fields, user: userId, params, skipRetain: true})
  const grouped=lodash(visios)
    .groupBy(v => !!v.start_date ? moment(v.start_date).startOf('day') : null)
    .entries()
    .map(([day, visios]) => new mongoose.models.visioDay({day, visios:visios.map(v => new mongoose.models.visio(v))}))
    .value()
  return grouped
}

/**
 * My visios are the one whose:
 *  - creator is me (trainer)
 *  - _owner is me (trainee for cocahing)
 *  - _owner is any group my session belongs to
 */
const getUserVisiosDays = async (userId, params, data, fields, actualLogged) => {
  const VISIOS_FILTER = /visios\./
  const VISIOS_FILTER2 = /\.visios/
  fields=fields.filter(f => VISIOS_FILTER.test(f)).map(f => f.replace(VISIOS_FILTER, ''))
  params=lodash(params)
    .pickBy((_, f) => VISIOS_FILTER2.test(f))
    .mapKeys((_, f) => f.replace(VISIOS_FILTER2, ''))
    .value()
  const role=(await User.findById(userId)).role
  const _owner=[]
  if (role==ROLE_APPRENANT) {
    _owner.push(userId)
  }
  const mySessions=await Session.find({trainees: userId}, {_id:1})
  const myGroups=await Group.find({sessions: {$in: mySessions}}, {_id:1})
  _owner.push(...myGroups, ...mySessions)
  params={'filter._owner': _owner}
  if (role==ROLE_FORMATEUR) {
    params['filter.creator']=userId
  }
  console.log('params', params)
  const visios=await loadFromDb({model: 'visio', fields, user: userId, params, skipRetain: true})
  const grouped=lodash(visios)
    .groupBy(v => !!v.start_date ? moment(v.start_date).startOf('day') : null)
    .entries()
    .map(([day, visios]) => new mongoose.models.visioDay({day, visios:visios.map(v => new mongoose.models.visio(v))}))
    .value()
  return grouped
}

/**
 * Returns the visio type plus the owner's name (group/session/trainee)
 */
const getVisioTypeStr = async (userId, params, data, fields, actualLogged) => {
  const v=await mongoose.models.visio.findById(data._id)
    .populate({path: '_owner', populate: 'fullname'})
  const type_str=VISIO_TYPE[data.type]
  return `${type_str} (${v._owner.name || v._owner.fullname})`  
}

const getSessionTraineeVisio = async (session_id, user_id) => {
  console.log('Getting sesison trainees', session_id, user_id)
  const groups=(await Group.find({sessions: session_id})).map(g => g._id)
  const ids=[user_id, session_id, ...groups]
  const visios=await mongoose.models.visio.find({_owner: {$in: ids}})
  console.log('Getting visios', visios)
  const spentTimes=await mongoose.models.visioProgress.find({visio: {$in: visios}, user: user_id})
    .populate('visio')
  const result=spentTimes.map(s => ({name: s.visio.title, spent_time_str: formatDuration(s.spent_time)}))
  return result
}

module.exports={
  getGroupVisiosDays, getUserVisiosDays, getVisioTypeStr, getSessionTraineeVisio,
}