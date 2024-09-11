const mongoose = require('mongoose')
const path = require('path')
const lodash=require('lodash')
const Homework = require("../../models/Homework")
const { idEqual } = require("../../utils/database")
const { RESOURCE_TYPE_EXT, BLOCK_STATUS, BLOCK_STATUS_TO_COME, BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED } = require('./consts')
const Progress = require('../../models/Progress')
const { formatDuration } = require('../../../utils/text')
const Block = require('../../models/Block')

const getBlockResources = async blockId => {
  const pipeline = [
    { $match: { parent: blockId } },
    {
      $graphLookup: {
        from: 'blocks',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parent',
        as: 'descendants'
      }
    },
    { $unwind: '$descendants' },
    { $match: { 'descendants.type': 'resource' } },
    { $project: { 'descendants._id': 1 } }
  ]

  const result = await Block.aggregate(pipeline)
  return result.map(doc => doc.descendants._id)
}

const getProgress = async ({user, block}) => {
  return Progress.findOne({user, block})
}

const blockHasStatus = async ({user, block, status}) => {
  return Progress.exists({user, block, achievement_status: status})
}
const getBlockSpentTime = async (userId, params, data) => {
  return (await getProgress({user: userId, block: data._id}))?.spent_time || 0
}

const getBlockSpentTimeStr = async (userId, params, data) => {
  const spentTime= await getBlockSpentTime(userId, params, data)
  return formatDuration(spentTime || 0)
}

const getUserHomeworks = async (userId, params, data) => {
  return Homework.find({user: userId, resource: data._id})
}

const getFinishedResourcesCount = async (userId, params, data) => {
  const resourceIds=await getBlockResources(data._id)
  const finished=await Promise.all(resourceIds.map(id => blockHasStatus({user: userId, block: id, status: BLOCK_STATUS_FINISHED})))
  const res=finished.filter(v => !!v).length
  return res
}

const getResourcesProgress = async (userId, params, data) => {
  const resourceIds=await getBlockResources(data._id)
  const total = resourceIds.length
  const finished=await Promise.all(resourceIds.map(id => blockHasStatus({user: userId, block: id, status: BLOCK_STATUS_FINISHED})))
  const res=finished.filter(v => !!v).length
  return res/total
}

const getResourceAnnotation = async (userId, params, data) => {
  return (await getProgress({user: userId, block: data._id}))?.annotation
}

const setResourceAnnotation = async ({ id, attribute, value, user }) => {
  return Progress.findOneAndUpdate(
    {user: user, block: id},
    {user: user, block: id, annotation: value},
    {upsert: true, new: true})
}

const isResourceMine = async (userId, params, data) => {
  return idEqual(userId, data.creator?._id)
}

const onSpentTimeChanged = async ({ blockId, user }) => {
  // TODO implement
  throw new Error('not implemented')
}

const getResourceType = async url => {
  const extension=path.extname(url)
  const res=Object.entries(RESOURCE_TYPE_EXT).find(([type, extensions]) => extensions.includes(extension))
  if (!res) {
    throw new Error(`Type de ressource inconnu`)
  }
  return res[0]
}

const getResourcesCount = async (userId, params, data) => {
  const subResourcesIds=await getBlockResources(data._id)
  return subResourcesIds.length
}

const canPlay = async ({dataId, user }) => {
  return blockHasStatus({user, block: dataId, status: BLOCK_STATUS_TO_COME})
}

const canResume = async ({dataId, user }) => {
  return blockHasStatus({user, block: dataId, status: BLOCK_STATUS_CURRENT})
}

const canReplay = async ({dataId, user }) => {
  return blockHasStatus({user, block: dataId, status: BLOCK_STATUS_FINISHED})
}

const getBlockNote = async (userId, params, data) => {
  return (await getProgress({user: userId, block: data._id}))?.note || null
}

module.exports={
  getFinishedResourcesCount, isResourceMine, setResourceAnnotation, getResourceAnnotation, getResourcesProgress, getUserHomeworks, onSpentTimeChanged,
  getResourceType, getBlockSpentTime, getBlockSpentTimeStr, getResourcesCount, canPlay, canReplay, canResume,
  getBlockResources, getBlockNote
}