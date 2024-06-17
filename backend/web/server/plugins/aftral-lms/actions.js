const mongoose=require('mongoose')
const { swapArray } = require('../../../utils/functions')
const Block = require('../../models/Block')
const Duration = require('../../models/Duration')
const Resource = require('../../models/Resource')
const { getModel, idEqual } = require('../../utils/database')
const { ForbiddenError, NotFoundError, BadRequestError } = require('../../utils/errors')
const {addAction, setAllowActionFn}=require('../../utils/studio/actions')
const { BLOCK_TYPE, ROLE_CONCEPTEUR, ROLE_FORMATEUR, ROLES, BLOCK_STATUS_FINISHED, BLOCK_STATUS_CURRENT, BLOCK_STATUS_TO_COME, BLOCK_STATUS_UNAVAILABLE } = require('./consts')
const {lockSession, onSpentTimeChanged, getSessionBlocks, computeBlocksCount, onBlockCountChange } = require('./functions')

const ACCEPTS={
  session: ['program'],
  program: ['module', 'sequence'],
  module: ['sequence', 'resource'],
  sequence: ['resource'],
}

const acceptsChild= (pType, cType) => {
  return ACCEPTS[pType]?.includes(cType)
}

const moveChildInParent= (parentId, childId, up) => {
  return Block.findById(parentId)
    .then(parent => {
      if (!parent) { throw new NotFoundError(`Parent introuvable`)}
      const children=parent.actual_children.map(c => c._id.toString())
      const childIdx=children.indexOf(childId)
      if (childIdx==-1) { throw new NotFoundError(`Enfant introuvable`)}
      if (up && childIdx==0) { throw new BadRequestError(`Déjà premier de la liste`)}
      if (!up && childIdx==children.length-1) { throw new BadRequestError(`Déjà dernier de la liste`)}
      const otherIdx=up ? childIdx-1 : childIdx+1
      const newChildren=swapArray(children, childIdx, otherIdx)
      return Block.findByIdAndUpdate(parentId, {actual_children: newChildren})
    })
}

const addChildAction = ({parent, child}, user) => {
  if (user.role!=ROLE_CONCEPTEUR) {
    throw new ForbiddenError(`Forbidden for role ${ROLES[user.role]}`)
  }
  return Promise.all([parent, child].map(id => Block.findById(id, {[BLOCK_TYPE]: 1})))
    .then(([parent, child]) => {
      const [pType, cType]=[parent?.type, child?.type]
      if (!pType || !cType) { throw new Error('program/module/sequence/ressource attendu')}
      if (!acceptsChild(pType, cType)) { throw new Error(`${cType} ne peut être ajouté à ${pType}`)}
      return mongoose.model(cType).create({origin: child._id, creator: user})
    })
    .then(linkedChild => Block.findByIdAndUpdate(parent, {$addToSet: {actual_children: linkedChild}}))
    .then(() => onBlockCountChange(parent))
}
addAction('addChild', addChildAction)

const removeChildAction = ({parent, child}, user) => {
  if (user.role!=ROLE_CONCEPTEUR) {
    throw new ForbiddenError(`Forbidden for role ${ROLES[user.role]}`)
  }
  return Promise.all([Block.findById(parent),Block.findById(child)])
    .then(([parentObj, childObj]) => {
      if (!parentObj) { throw new NotFoundError(`Can not find parent ${parent}`)}
      if (!childObj) { throw new NotFoundError(`Can not find child ${child}`)}
      if (!parentObj.children.find(v => idEqual(v._id, child))) { throw new BadRequestError(`Parent ${parent} has not child ${child}`)}
      return Promise.all([Block.deleteOne({_id: child}), Block.updateOne({_id: parent}, {$pull: {actual_children: child}})])
    })
    .then(() => onBlockCountChange(parent))
}
addAction('removeChild', removeChildAction)

const levelUpAction = ({parent, child}, user) => {
  return moveChildInParent(parent, child, true)
}
addAction('levelUp', levelUpAction)

const levelDownAction = ({parent, child}, user) => {
  return moveChildInParent(parent, child, false)
}
addAction('levelDown', levelDownAction)

const addSpentTimeAction = async ({id, duration}, user) => {
  const block=await Block.findById(id, {_locked:1})
  if (!block._locked) {
    throw new ForbiddenError(`addSpentTime forbidden on models/templates`)
  }
  const durationDoc=await Duration.findOne({block, user})
  if (durationDoc.status==BLOCK_STATUS_UNAVAILABLE) {
    throw new ForbiddenError(`addSpentTime forbidden on unavailable resource`)
  }
  durationDoc.duration+=duration/1000
  await durationDoc.save()
  console.log('Duration block is', durationDoc)
  return onSpentTimeChanged({blockId: id, user})
}
addAction('addSpentTime', addSpentTimeAction)

const lockSessionAction = async ({value}, user) => {
  return lockSession(value, user)
}
addAction('lockSession', lockSessionAction)

const resourceAction = action => async ({value}, user) => {
  return isActionAllowed({action, dataId: value, user}) && {_id: value}
}

addAction('play', resourceAction('play'))
addAction('resume', resourceAction('resume'))
addAction('replay', resourceAction('replay'))

const isActionAllowed = async ({ action, dataId, user }) => {
  if (action=='addChild') {
    if (![ROLE_CONCEPTEUR, ROLE_FORMATEUR].includes(user?.role)) { throw new ForbiddenError(`Action non autorisée`)}
  }
  if (['play', 'resume', 'replay'].includes(action)) {
    const block=await Block.findOne({_id: dataId, type: 'resource'})
    if (!block) { 
      throw new NotFoundError(`Ressource introuvable`)
    }
    const parent=await Block.findOne({actual_achildren: dataId})
    const duration=await Duration.findOne({block: dataId, user})
    if (action=='play' && duration?.status!=BLOCK_STATUS_TO_COME) {
      throw new NotFoundError(`Cette ressource ne peut être jouée`)
    }
    if (action=='resume' && duration?.status!=BLOCK_STATUS_CURRENT) {
      throw new NotFoundError(`Cette ressource ne peut être jouée`)
    }
    if (action=='replay' && duration?.status!=BLOCK_STATUS_FINISHED && !parent?.closed) {
      throw new NotFoundError(`Cette ressource ne peut être rejouée`)
    }
  }
  return true
}

setAllowActionFn(isActionAllowed)