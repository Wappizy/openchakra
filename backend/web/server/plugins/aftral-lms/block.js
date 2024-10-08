const lodash = require("lodash");
const moment = require("moment");
const mongoose=require('mongoose')
const Progress = require("../../models/Progress")
const { BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, BLOCK_STATUS_TO_COME, BLOCK_STATUS_UNAVAILABLE, ACHIEVEMENT_RULE_CHECK, ROLE_CONCEPTEUR, ROLE_APPRENANT, ROLE_ADMINISTRATEUR, BLOCK_TYPE, BLOCK_TYPE_RESOURCE, BLOCK_TYPE_SESSION, SCALE_ACQUIRED, RESOURCE_TYPE_SCORM } = require("./consts");
const { getBlockResources } = require("./resources");
const { idEqual, loadFromDb, getModel } = require("../../utils/database");
const User = require("../../models/User");
const SessionConversation = require("../../models/SessionConversation");
const Homework = require("../../models/Homework");
const { BadRequestError } = require("../../utils/errors");
const { CREATED_AT_ATTRIBUTE } = require("../../../utils/consts");
const { parseScormTime } = require("../../../utils/dateutils");

const LINKED_ATTRIBUTES_CONVERSION={
  name: lodash.identity,
  closed: v => v || false,
  masked: v => v || false,
  description: lodash.identity,
  picture: lodash.identity, 
  optional : v => v || false, 
  code: lodash.identity, 
  access_condition: v => v || false, 
  resource_type: v => v || undefined,
  homework_mode: lodash.identity,
  url: lodash.identity,
  evaluation: v => v || false,
  achievement_rule : v => v || undefined,
  success_note_min: lodash.identity,
  success_note_max: lodash.identity,
  success_scale: v=>v || false,
  max_attempts: lodash.identity,
  note: lodash.identity,
  scale: lodash.identity,
  correction: lodash.identity,
}

const LINKED_ATTRIBUTES=Object.keys(LINKED_ATTRIBUTES_CONVERSION)

const NULLED_ATTRIBUTES=Object.fromEntries(LINKED_ATTRIBUTES.map(att => ([att, undefined])))

const ensureMongooseModel = data => {
  if (data.constructor.name != 'model') {
    throw new Error(`Expecting mongoose object:`, JSON.stringify(data));
  }
}

const getProgress = async (userId, blockId) => {
  return mongoose.models.progress.findOne({user: userId, block: blockId})
}

const setParentSession = async (session_id) => {
  const allBlocks=await getSessionBlocks(session_id)
  return mongoose.models.block.updateMany({_id: {$in: allBlocks}}, {session: session_id})
}

const getSessionBlocks = async block => {
  if (!(block instanceof mongoose.Model)) {
    throw new Error(`Expecting mongoose object`)
  }
  const res=[block]
  if (block.children===undefined) {
    await block.populate('children').execPopulate()
  }
  const subChildren=await Promise.all(block.children.map(child => getSessionBlocks(child)))
  res.push(...lodash.flatten(subChildren))
  return res
}

const getParentBlocks = async blockId => {
  const res=[]
  let block=await mongoose.models.block.findById(blockId, {parent:1})
  while (block.parent) {
    res.push(block.parent._id)
    block=await mongoose.models.block.findById(block.parent, {parent:1})
  }
  return res
}

const getBlockStatus = async (userId, params, data) => {
  if (data.type=='session') {
    const finished=await mongoose.models.session.exists({_id: data._id, end_date: {$lt: moment()}})
    if (finished) {
      return BLOCK_STATUS_FINISHED
    }
  }
  return (await Progress.findOne({ block: data._id, user: userId }))?.achievement_status
}

const cloneTree = async (blockId, parentId) => {
  if (!blockId || !parentId) {
    throw new Error(`childId and parentId are expected`)
  }
  const parentChildrenCount=await mongoose.models.block.countDocuments({parent: parentId})
  const newOrder=parentChildrenCount+1
  const block=await mongoose.models.block.findById(blockId).populate('children')
  let blockData={
    order: newOrder,
    ...lodash.omit(block.toObject(), ['id', '_id', 'origin', 'parent']),
    id: undefined, _id: undefined, origin: blockId, parent: parentId,
  }

  const newBlock=new mongoose.models.block({...blockData})
  await newBlock.save()
  let children=await Promise.all(block.children.map(childId => cloneTree(childId._id, newBlock._id)))
  newBlock.children=children.map(c => c._id)
  return newBlock.save()
}

const cloneTemplate = async (blockId, user) => {
  if (!blockId) {
    throw new Error(`blockId is expected`)
  }
  const block=await mongoose.models.block.findById(blockId).populate('children')
  const newName=`Copie de ${block.name}`
  let blockData={
    ...lodash.omit(block.toObject(), ['id', '_id', 'origin', 'parent']),
    id: undefined, _id: undefined, origin: null,
    name: newName,
  }

  const newBlock=new mongoose.models.block({...blockData})
  await newBlock.save()
  await Promise.all(block.children.map(child => addChild({parent: newBlock._id, child: child.origin._id, user})))
  return newBlock
}

// Loads the chain from blockId to its root origin
const loadChain = async blockId => {
  const result = await mongoose.models.block.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(blockId) }
    },
    {
      $graphLookup: {
        from: 'blocks',
        startWith: '$_id',
        connectFromField: 'origin',
        connectToField: '_id',
        as: 'blockChain'
      }
    }
  ]);
  
  if (result.length === 0) {
    return []
  }

  // Combine the root block with its entire chain
  const rootBlock = result[0];
  const blockChain = [rootBlock, ...rootBlock.blockChain];

  // Sort the blocks to maintain the order based on their origin
  const blockMap = {};
  blockChain.forEach(block => {
    blockMap[block._id.toString()] = block;
  });

  const sortedBlocks = [];
  let currentBlock = rootBlock;

  while (currentBlock) {
    sortedBlocks.push(currentBlock);
    currentBlock = currentBlock.origin ? blockMap[currentBlock.origin.toString()] : null;
  }

  return sortedBlocks;

}

const isFinished = async (user, block) => {
  return Progress.exists({user, block, achievement_status: BLOCK_STATUS_FINISHED})
}

const onBlockFinished = async (user, block) => {
  await saveBlockStatus(user, block, BLOCK_STATUS_FINISHED)
  const session=await getBlockSession(block)
  return updateSessionStatus(session._id, user._id)
}

const onBlockAction = async (user, block) => {
  const bl=await mongoose.models.block.findById(block)
  // Is it a scorm ?
  if (bl.resource_type==RESOURCE_TYPE_SCORM) {
    const scormData=await getBlockScormData(user, block)
    const scormSuccess=scormData?.['cmi.core.lesson_status']=='passed'
    const scormMinNoteReached=!block.success_note_min && parseInt(scormData?.['cmi.core.score.raw']) > block.success_note_min
    if (scormSuccess || scormMinNoteReached)  {
      if (!(await isFinished(user, block))) {
        await saveBlockStatus(user, block, BLOCK_STATUS_FINISHED)
        return onBlockFinished(user, block)
      }
    }
    return
  }
  // Homework priority on other rules
  if (bl.homework_mode) {
    const homeworks=await Homework.find({trainee: user, resource: block}).sort({[CREATED_AT_ATTRIBUTE]: 1})
    const latest_homework=homeworks.pop()
    if (!!latest_homework) {
      if ((bl.success_scale && latest_homework.scale==SCALE_ACQUIRED)
      ||!bl.success_scale && latest_homework.note>=bl.success_note_min) {
    if (!(await isFinished(user, block))) {
          await saveBlockStatus(user, block, BLOCK_STATUS_FINISHED)
          return onBlockFinished(user, block)
        }
      }
      else {
        await removeBlockStatus(user, block)
      }
    }
    return
  }
  const progress=await Progress.findOne({user, block})
  const rule=bl.achievement_rule
  const finished=ACHIEVEMENT_RULE_CHECK[rule](progress)
  const status=finished ? BLOCK_STATUS_FINISHED : BLOCK_STATUS_CURRENT
  await saveBlockStatus(user, block, status)
  if (finished) {
    console.log(`Block ${block} finished`)
    onBlockFinished(user, block)
  }
}

// Return the session for this block
const getBlockSession = async blockId => {
  const block=await mongoose.models.block.findById(blockId, {type:1, parent:1})
  if (block.type=='session') {
    return block._id
  }
  if (!block.parent) {
    throw new Error(`${blockId}: no session found and no parent`)
  }
  return getBlockSession(block.parent)
}

const getNextResource= async (blockId, user) => {
  const session=await getBlockSession(blockId, user)
  const resources=await getBlockResources({blockId: session, userId: user, allResources: false})
  const idx=resources.findIndex(r => idEqual(r._id, blockId))
  if ((idx+1)>=resources.length) {
    throw new Error('Pas de ressource suivante')
  }
  return {_id: resources[idx+1]._id}
}

const getPreviousResource= async (blockId, user) => {
  const session=await getBlockSession(blockId, user)
  const resources=await getBlockResources({blockId: session, userId: user, allResources: false})
  const idx=resources.findIndex(r => idEqual(r._id, blockId))
  if (idx==0) {
    throw new Error('Pas de ressource précédente')
  }
  return {_id: resources[idx-1]._id}
}

const getSession = async (userId, params, data, fields) => {
  let currentBlock = await mongoose.models.block.findById(data._id,{parent:1, type:1})
  while (!!currentBlock.parent) {
    currentBlock = await mongoose.models.block.findById(currentBlock.parent,{parent:1, type:1})
  }
  const model = await getModel(currentBlock._id)
  if(model != `session`) {
    return {}
  }
  const [result] = await loadFromDb({model: 'block', id:currentBlock._id, fields, user:userId})
  return result
}

const getBlockLiked = async (userId, params, data) => {
  const user = await User.findById(userId, {role:1})
  const template = await getTemplate(data._id)
  if(user.role == ROLE_CONCEPTEUR) {
    return template._liked_by.length > 0
  }
  return template._liked_by.some(like => idEqual(like, userId))
}

const getBlockDisliked = async (userId, params, data) => {
  const user = await User.findById(userId, {role:1})
  const template = await getTemplate(data._id)
  if(user.role == ROLE_CONCEPTEUR) {
    return template._disliked_by.length > 0
  }
  return template._disliked_by.some(dislike => idEqual(dislike, userId))
}

const setBlockLiked = async ({ id, attribute, value, user }) => {
  const template = await getTemplate(id)
  if(value) {
    return mongoose.models['block'].findByIdAndUpdate(template._id,
      {
        $pull: {
          _disliked_by: user._id
        }, 
        $addToSet: {
          _liked_by: user._id
        }
      }
    )
  }
  else{
    return mongoose.models['block'].findByIdAndUpdate(template._id,
      {$pull: {_liked_by: user._id}})
  }
}

const setBlockDisliked = async ({ id, attribute, value, user }) => {
  const template = await getTemplate(id)
  if(value) {
    return mongoose.models['block'].findByIdAndUpdate(template._id,
      {
        $pull: {
          _liked_by: user._id
        }, 
        $addToSet: {
          _disliked_by: user._id
        }
      }
    )
  }
  else{
    return mongoose.models['block'].findByIdAndUpdate(template._id,
      {$pull: {_disliked_by: user._id}})
  }
}

const getTemplate = async (id) => {
  let block=await mongoose.models.block.findById(id, {origin:1, _liked_by:1, _disliked_by:1})
  if (!block.origin) {
    return block
  }
  return await getTemplate(block.origin)
}

const getAvailableCodes =  async (userId, params, data) => {
  if(data.type != 'program') {
    return []
  }
  let otherPrograms=await mongoose.models.block.find({_id: {$ne: data._id}, type:'program'}).populate('codes')
  const usedCodes=lodash(otherPrograms).map(p => p.codes).flatten().map(c => c.code).value()
  let availableCodes=await mongoose.models.productCode.find({code: {$nin: usedCodes}})
  return availableCodes
}

const getBlockHomeworks = async (userId, params, data, displayFields, actualLogged) => {
  const isTrainee=await User.exists({_id: actualLogged, role: ROLE_APPRENANT})
  const filter=isTrainee ?  {resource: data._id, trainee: userId} : {resource: data._id}
  const homeworks=await Homework.find(filter)
    .populate(['trainee', 'resource'])
  return homeworks
}

const getBlockHomeworksSubmitted = async (userId, params, data) => {
  const progress = await mongoose.models.progress.find({
    block:data._id
  }).populate('homeworks')
  const homeworks = progress.filter(p=> p.homeworks.length>0)
  return homeworks.length
}

const getBlockHomeworksMissing = async (userId, params, data) => {
  const session = await mongoose.models.session.findById(data.session)
  const progress = await mongoose.models.progress.find({
    block:data._id
  }).populate('homeworks')
  const homeworks = progress.filter(p=> p.homeworks.length>0)
  const result = session.trainees.length - homeworks.length
  return result
}

const getBlockTraineesCount = async (userId, params, data) => {
  const session = await mongoose.models.session.findById(data.session)
  return session.trainees ? session.trainees.length : 0
}

const getBlockFinishedChildren = async (userId, params, data, fields) => {
  const proccessedFields = fields.map(f => `block.` + f)
  proccessedFields.push(`user`)
  proccessedFields.push(`achievement_status`)

  const loadedProgresses = await loadFromDb({
    model: `progress`,
    fields: proccessedFields,
  })

  if (loadedProgresses.length == 0) {
    return null
  }

  const finishedChildren = loadedProgresses.filter(
    p => p.user && idEqual(p.user._id, userId) && p.achievement_status === BLOCK_STATUS_FINISHED
  ).map(p => p.block)

  if (finishedChildren.length == 0) {
    return null
  }

  return finishedChildren
}

const getFinishedChildrenCount = async (userId, params, data, fields) => {
  const children=await mongoose.models.block.find({parent: data._id, masked:{$ne: true}}, {_id: 1})
  const finished=await Progress.countDocuments({block: {$in: children}, user: userId, achievement_status: BLOCK_STATUS_FINISHED})
  return finished.filter(Boolean).length
}

const getSessionConversations = async (userId, params, data, fields) => {
  const user = await User.findById(userId)
  const convs = await SessionConversation.find({
    session: data._id,
    ...user.role == ROLE_APPRENANT ? {trainee:user._id} : {}

  })
  const newParams = {}
  const convIds = convs.map(c=>c._id)
  newParams[`filter._id`] = {$in:convIds}
  let res = await loadFromDb({
    model: `sessionConversation`,
    params:newParams,
    fields,
    user
  })
  res = res.map(r=> new SessionConversation(r))
  return res
}

const propagateAttributes=async (blockId, attributes=null) => {
  if (attributes && attributes.length==0) {
    return
  }
  const is_template=attributes==null
  if (is_template) {
    console.time(`Propagating for ${blockId}`)
  }
  const block=await mongoose.models.block.findById(blockId)
  if (attributes==null) {
    attributes=lodash(block.toObject()).pick(LINKED_ATTRIBUTES).value()
    attributes=lodash.mapValues(attributes, (v, k) => LINKED_ATTRIBUTES_CONVERSION[k](v))
  }
  else {
    const forced=block._forced_attributes || []
    attributes=lodash.omit(attributes, forced)
    // console.log('Setting', blockId, 'attributes', attributes)
    Object.assign(block, attributes)
    await block.save().catch(err => {
      console.error('Block', blockId, attributes, err)
      throw err
    })
  }
  const ancestors=await mongoose.models.block.find({origin: blockId}, {_id:1})
  await Promise.all(ancestors.map( a => propagateAttributes(a._id, attributes)))
  if (is_template) {
    console.timeEnd(`Propagating for ${blockId}`)
  }
}

const getBlockTicketsCount = async (userId, params, data) => {
  const ids = [data._id]
  if(data.is_template) {
    const allDependants = await data.getDependants()
    allDependants.map(dep => ids.push(dep._id))
  }
  const count = await mongoose.models.ticket.countDocuments({block:{$in:ids}})
  return count
}

const updateChildrenOrder = async parentId => {
  const children=await mongoose.models.block.find({parent: parentId}).sort({order:1})
  await Promise.all(children.map((child, idx) => {
    child.order=idx+1
    return child.save()
  }))
}

const ACCEPTS={
  session: ['program'],
  program: ['chapter', 'module'],
  chapter: ['module'],
  module: ['sequence'],
  sequence: ['resource'],
}

const acceptsChild= (pType, cType) => {
  return ACCEPTS[pType]?.includes(cType)
}

const addChild = async ({parent, child, user}) => {
  // Allow ADMIN to add child for session import
  if (![ROLE_ADMINISTRATEUR, ROLE_CONCEPTEUR].includes(user.role)) {
    throw new ForbiddenError(`Forbidden for role ${ROLES[user.role]}`)
  }
  [parent, child] = await Promise.all([parent, child].map(id => mongoose.models.block.findById(id, {[BLOCK_TYPE]: 1})))
  const [pType, cType]=[parent?.type, child?.type]
  if (!pType || !cType) { throw new Error('program/module/sequence/ressource attendu')}
  if (!!parent.origin) {
    throw new BadRequestError(`Le parent doit être un template`)
  }
  if (!!child.origin) {
    throw new BadRequestError(`Le fils doit être un template`)
  }
  if (!acceptsChild(pType, cType)) { throw new Error(`${cType} ne peut être ajouté à ${pType}`)}
  const createdChild = await cloneTree(child._id, parent._id)
  await mongoose.models.block.findByIdAndUpdate(parent, {last_updater: user})

  // Now propagate to all origins
  const origins=await mongoose.models.block.find({origin: parent._id}, {_id:1})
  await Promise.all(origins.map(origin => addChild({parent: origin._id, child: createdChild._id, user})))
}

const lockSession = async blockId => {
  const toManage=[await mongoose.models.block.findById(blockId)]
  while (toManage.length>0) {
    let block=toManage.pop()
    if (!block) {
      throw new Error('blcok numm')
    }
    const children=await  mongoose.models.block.find({parent: block._id})
    if (block.type=='session') {
      if (lodash.isEmpty(block.trainees)) {
        throw new BadRequestError(`Démarrage session ${block.code} impossible: pas d'apprenant`)
      }
      if (lodash.isEmpty(children)) {
        throw new BadRequestError(`Démarrage session ${block.code} impossible: pas de programme`)
      }
    }
    if (block._locked) {
      // console.warn(`Session block`, block._id, block.type, `is already locked but next actions will be executed`)
    }
    if (block.type=='session') {
      setSessionInitialStatus(block._id, block.trainees.map(t => t._id))
    }

    block._locked=true
    await block.save().catch(err => {
      err.message=`${block._id}:${err}`
      throw err
    })
    toManage.push(...children)
  }
}

const setSessionInitialStatus = async blockId => {
  return updateSessionStatus(blockId)
}

const hasParentMasked = async (blockId) => {
  const block=await mongoose.models.block.findById(blockId, {masked: true}).lean({virtuals: false})
  return block.masked || (block.parent && hasParentMasked(block.parent))
}

const saveBlockStatus= async (userId, blockId, status) => {
  if (!userId || !blockId || !status) {
    throw new Error(userId, blockId, status)
  }
  await Progress.findOneAndUpdate(
    {block: blockId, user: userId},
    {block: blockId, user: userId, achievement_status: status},
    {upsert: true}
  )
  return status
}

const saveBlockScormData = async (userId, blockId, data) => {
  if (!userId || !blockId || !data) {
    throw new Error(userId, blockId, data)
  }
  const set={block: blockId, user: userId, scorm_data: JSON.stringify(data)}
  const spentTime=parseScormTime(data['cmi.core.session_time'])
  if (spentTime) {
    set.spent_time=spentTime
  }
  await Progress.findOneAndUpdate({block: blockId, user: userId},set,{upsert: true})
}

const getBlockScormData = async (userId, blockId) => {
  if (!userId || !blockId) {
    throw new Error(userId, blockId)
  }
  const pr=await Progress.findOne({block: blockId, user: userId})
  if (pr?.scorm_data) {
    return JSON.parse(pr.scorm_data)
  }
}

const removeBlockStatus= async (userId, blockId, status) => {
  if (!userId || !blockId) {
    throw new Error(userId, blockId, status)
  }
  return Progress.remove({block: blockId, user: userId})
}

const computeBlockStatus = async (blockId, isFinishedBlock, setBlockStatus) => {

  const block=await mongoose.models.block.findById(blockId).populate('children')

  if (block.type === BLOCK_TYPE_RESOURCE) {
    const isFinished = await isFinishedBlock(block)
    const status = isFinished || block.optional ? BLOCK_STATUS_FINISHED : BLOCK_STATUS_TO_COME;
    await setBlockStatus(block.id, status)
    return status;
  }

  let allChildrenTerminated = true;
  let availableChildFound = false;

  // Traverse children
  for (let i = 0; i < block.children.length; i++) {
    const child = block.children[i]
    const childState = await computeBlockStatus(child, isFinishedBlock, setBlockStatus)

    if (childState !== BLOCK_STATUS_FINISHED) {
      allChildrenTerminated = false;
    }

    // Closed
    if (block.closed) {
      if (childState !== BLOCK_STATUS_FINISHED) {
        const status = BLOCK_STATUS_UNAVAILABLE;
        await setBlockStatus(block.id, status)
        return status
      }
    } else if (block.ordered) {
      if (i === 0 || (await computeBlockStatus(block.children[i - 1], isFinishedBlock, setBlockStatus)) === BLOCK_STATUS_FINISHED) {
        if (!availableChildFound) {
          availableChildFound = true;
          const status = BLOCK_STATUS_TO_COME;
          await setBlockStatus(block.id, status)
          return status;
        }
      }
    } else {
      if (childState === BLOCK_STATUS_TO_COME && !availableChildFound) {
        availableChildFound = true;
      }
    }
  }

  if (block.access_condition) {
    for (let i = 0; i < block.children.length; i++) {
      const child = block.children[i];
      for (let j = 0; j < i; j++) {
        const leftSiblingState = await computeBlockStatus(block.children[j], isFinishedBlock, setBlockStatus);
        if (leftSiblingState !== BLOCK_STATUS_FINISHED) {
          const status = BLOCK_STATUS_UNAVAILABLE;
          await setBlockStatus(block.id, status)
          return status;
        }
      }
      const status = BLOCK_STATUS_TO_COME;
      await setBlockStatus(block.id, status)
      return status;
    }
  }

  if (allChildrenTerminated) {
    const status = BLOCK_STATUS_FINISHED;
    await setBlockStatus(block.id, status)
    return status;
  }

  // Si un enfant est disponible, le bloc est disponible
  if (availableChildFound) {
    const status = BLOCK_STATUS_TO_COME;
    await setBlockStatus(block.id, status)
    return status;
  }

  // Sinon, le bloc n'est pas disponible
  const status = BLOCK_STATUS_UNAVAILABLE;
  console.log(block.type, block.name, block.order, status)
  await setBlockStatus(block.id, status)
  return status;
}


const updateSessionStatus = async (sessionId, trainee) => {
  console.time('update session status')
  const session=await mongoose.models.session.findById(sessionId)
  const trainees=!!trainee ? [trainee] : session.trainees
  await Promise.all(trainees.map(async t => {
    const isFinishedBlock = async blockId => isFinished(t._id, blockId)
    const setBlockStatus = (blockId, status) => saveBlockStatus(t._id, blockId, status)
    await computeBlockStatus(sessionId, isFinishedBlock, setBlockStatus)
  }))
  console.timeEnd('update session status')
}

const setScormData= async (userId, blockId, data) => {
  await saveBlockScormData(userId, blockId, data)
  await onBlockAction(userId, blockId)
}

const getBlockNote = async (userId, params, data) => {
  const isTrainee=await User.exists({_id: userId, role: ROLE_APPRENANT})
  if (!isTrainee) {
    return undefined
  }
  if (!!data.homework_mode) {
    const homeworks=await Homework.find({resource: data._id, trainee: userId})
    const note=lodash.max(homeworks.map(h => h.note))
    return note
  }
  else if (data.resource_type==RESOURCE_TYPE_SCORM) {
    const scormData=await getBlockScormData(userId, data._id)
    return scormData?.['cmi.core.score.raw'] || undefined
  }
  else {
    return (await getProgress({user: userId, block: data._id}))?.note || null
  }
}

const setBlockNote = async ({ id, attribute, value, user }) => {
  const bl=await Block.findById(id)
  if (!lodash.inRange(value, 0, bl.success_note_max+1)) {
    throw new BadRequestError(`La note doit être comprise ente 0 et ${bl.success_note_max}`)
  }
  if (!!bl.homework_mode) {
    throw new BadRequestError(`La note doit être mise sur un devoir`)
  }
  pr = await getProgress({user, id})
  pr.note=value
  return pr.save()
}


module.exports={
  getBlockStatus, getSessionBlocks, setParentSession, 
  cloneTree, LINKED_ATTRIBUTES, onBlockFinished, onBlockAction,
  getNextResource, getPreviousResource, getParentBlocks,LINKED_ATTRIBUTES_CONVERSION,
  getSession, getBlockLiked, getBlockDisliked, setBlockLiked, setBlockDisliked,
  getAvailableCodes, getBlockHomeworks, getBlockHomeworksSubmitted, getBlockHomeworksMissing, getBlockTraineesCount,
  getBlockFinishedChildren, getSessionConversations, propagateAttributes, getBlockTicketsCount,
  updateChildrenOrder, cloneTemplate, addChild, getTemplate, lockSession, setSessionInitialStatus,
  updateSessionStatus, saveBlockStatus, setScormData, getBlockNote, setBlockNote, getBlockScormData,getFinishedChildrenCount,
}