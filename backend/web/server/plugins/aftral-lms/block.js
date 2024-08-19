const lodash = require("lodash");
const NodeCache=require('node-cache')
const mongoose=require('mongoose')
const Progress = require("../../models/Progress")
const { BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, BLOCK_STATUS_TO_COME, BLOCK_STATUS_UNAVAILABLE, ACHIEVEMENT_RULE_CHECK, ROLE_CONCEPTEUR } = require("./consts");
const { getBlockResources } = require("./resources");
const { idEqual, loadFromDb, getModel } = require("../../utils/database");
const Block = require("../../models/Block");
const User = require("../../models/User");

const NAMES_CACHE=new NodeCache()

const LINKED_ATTRIBUTES_CONVERSION={
  name: lodash.identity,
  closed: v => v || false,
  masked: v => v || false,
  description: lodash.identity,
  picture: lodash.identity, 
  optional : v => v || false, 
  code: lodash.identity, 
  access_condition: v => v || false, 
  resource_type: lodash.identity,
  homework_mode: lodash.identity,
  url: lodash.identity,
  evaluation: v => v || false,
  achievement_rule : lodash.identity
}

const LINKED_ATTRIBUTES=Object.keys(LINKED_ATTRIBUTES_CONVERSION)

const NULLED_ATTRIBUTES=Object.fromEntries(LINKED_ATTRIBUTES.map(att => ([att, undefined])))

const ensureMongooseModel = data => {
  if (data.constructor.name != 'model') {
    throw new Error(`Expecting mongoose object:`, JSON.stringify(data));
  }
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
  return (await Progress.findOne({ block: data._id, user: userId }))?.achievement_status
}

const getBlockName = async (blockId) => {
  let result = NAMES_CACHE.get(blockId.toString())
  if (!result) {
    const block = await mongoose.models.block.findById(blockId, { name: 1, type: 1 })
    result = `${block.type}-${block.name} ${blockId}`
    NAMES_CACHE.set(blockId.toString(), result)
  }
  return result
}

const cloneTree = async (blockId, parentId) => {
  if (!blockId || !parentId) {
    throw new Error(`childId and parentId are expected`)
  }
  const parent=await mongoose.models.block.findById(parentId).populate('children_count')
  const newOrder=parent.children_count+1
  const [block]=await loadFromDb({model:'block', user:{role:ROLE_CONCEPTEUR}, id:blockId, fields:[
    'name',
    'closed',
    'masked',
    'description',
    'picture',
    'optional',
    'code',
    'access_condition',
    'resource_type',
    'homework_mode',
    'url',
    'evaluation',
    'achievement_rule',
    'children.resource_type',
    'creator',
    'type',
    'children.type'
  ]})
  let blockData={
    order: newOrder,
    ...lodash.omit(block, [...LINKED_ATTRIBUTES, 'id', '_id', 'origin', 'parent']),
    id: undefined, _id: undefined, origin: blockId, parent: parentId,
    ...NULLED_ATTRIBUTES,
  }
  if (block.resource_type) {
    blockData.resource_type = block.resource_type;
  }
  const newBlock=new mongoose.models.block({...blockData})
  await newBlock.save()
  let children=await Promise.all(block.children.map(childId => cloneTree(childId._id, newBlock._id)))
  newBlock.children=children.map(c => c._id)
  return newBlock.save()
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

const ChainCache = new NodeCache({stdTTL: 30})

const getChain = async blockId => {
  const key=blockId.toString()
  let chain=ChainCache.get(key)
  if (!chain) {
    chain=await loadChain(blockId)
    ChainCache.set(key, chain)
  }
  return chain
}

const ATTRIBUTES_CACHE=new NodeCache({stdTTL: 30})

// Gets attribute from this data, else from its origin
const getAttribute = attName => async (userId, params, data) => {
  const key=`${data._id}/${attName}`
  let res=ATTRIBUTES_CACHE.get(key)
  if (!res) {
    const chain=await getChain(data._id)
    const block=chain.find((block, idx) => {
      if (idx==chain.length-1) {
        return true
      }
      return !lodash.isNil(block[attName])
    })
    res=block[attName]
    ATTRIBUTES_CACHE.set(key, res)
  }
  return res
}

const isFinished = async (user, block) => {
  return Progress.exists({user, block, achievement_status: BLOCK_STATUS_FINISHED})
}

const onBlockFinished = async (user, block) => {
  ensureMongooseModel(block)
  await block.populate('parent').execPopulate()
  if (!block.parent) {
    return
  }
  await block.parent.populate('children').execPopulate()
  const allChildrenFinished = (await Promise.all(block.parent.children.map(c => isFinished(user, c)))).every(v => !!v)

  if (allChildrenFinished) {
    await Progress.findOneAndUpdate(
      {block: block.parent, user},
      {block: block.parent, user, achievement_status: BLOCK_STATUS_FINISHED},
      {upsert: true}
    )
    await onBlockFinished(user, block.parent)
  }
}

// Set all parents to current
const onBlockCurrent = async (user, block) => {
  ensureMongooseModel(block)
  await block.populate('parent').execPopulate()
  if (block.parent) {
    await Progress.findOneAndUpdate(
      {block: block.parent._id, user},
      {block: block.parent._id, user, achievement_status: BLOCK_STATUS_CURRENT},
      {upsert: true}
    )    
    return onBlockCurrent(user, block.parent)
  }
}

const onBlockAction = async (user, block) => {
  const progress=await Progress.findOne({user, block})
  const rule=await getAttribute('achievement_rule')(user._id, null, block)
  console.log('rule is', rule)
  const finished=ACHIEVEMENT_RULE_CHECK[rule](progress)
  const status=finished ? BLOCK_STATUS_FINISHED : BLOCK_STATUS_CURRENT
  await Progress.findOneAndUpdate(
    {block, user},
    {block, user, achievement_status: status},
    {upsert: true}
  )
  if (finished) {
    console.log(`Block ${block._id} finished`)
    onBlockFinished(user, block)
  }
  else {
    console.log(`Block ${block._id} becomes current`)
    onBlockCurrent(user, block)
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
  const session=await getBlockSession(blockId)
  const resources=await getBlockResources(session)
  const brothers=lodash.dropWhile(resources, id => !idEqual(id, blockId)).slice(1)
  if (!brothers[0]) {
    throw new Error('Pas de ressource suivante')
  }
  return {_id: brothers[0]}
}

const getPreviousResource= async (blockId, user) => {
  const session=await getBlockSession(blockId)
  let resources=await getBlockResources(session)
  resources.reverse()
  const brothers=lodash.dropWhile(resources, id => !idEqual(id, blockId)).slice(1)
  if (!brothers[0]) {
    throw new Error('Pas de ressource précédente')
  }
  return {_id: brothers[0]}
}

getSession = async (userId, params, data) => {
  switch(data.type) {
    case 'resource' :
      return data.parent.parent.parent.type == 'chapter'
      ? [data.parent.parent.parent.parent.parent._id]
      : [data.parent.parent.parent.parent._id]
    case 'sequence' :
      return data.parent.parent.type == 'chapter'
      ? [data.parent.parent.parent.parent._id]
      : [data.parent.parent.parent._id]
    case 'module' :
      return data.parent.type == 'chapter'
      ? [data.parent.parent.parent._id]
      : [data.parent.parent._id]
    case 'chapter' :
      return [data.parent.parent._id]
    case 'program' :
      return [data.parent._id]
  }
}

const getBlockLiked = async (userId, params, data) => {
  const user = await User.findById(userId, {role:1})
  const template = await getTemplate(data._id)
  if(user.role == ROLE_CONCEPTEUR) {
    return template.likes.length > 0
  }
  return template.likes.some(like => idEqual(like, userId))
}

const getBlockDisliked = async (userId, params, data) => {
  const user = await User.findById(userId, {role:1})
  const template = await getTemplate(data._id)
  console.log(template)
  if(user.role == ROLE_CONCEPTEUR) {
    return template.dislikes.length > 0
  }
  return template.dislikes.some(dislike => idEqual(dislike, userId))
}

const setBlockLiked = async ({ id, attribute, value, user }) => {
  const template = await getTemplate(id)
  if(value) {
    return mongoose.models['block'].findByIdAndUpdate(template._id,
      {
        $pull: {
          dislikes: user._id
        }, 
        $addToSet: {
          likes: user._id
        }
      }
    )
  }
  else{
    return mongoose.models['block'].findByIdAndUpdate(template._id,
      {$pull: {likes: user._id}})
  }
}

const setBlockDisliked = async ({ id, attribute, value, user }) => {
  const template = await getTemplate(id)
  if(value) {
    return mongoose.models['block'].findByIdAndUpdate(template._id,
      {
        $pull: {
          likes: user._id
        }, 
        $addToSet: {
          dislikes: user._id
        }
      }
    )
  }
  else{
    return mongoose.models['block'].findByIdAndUpdate(template._id,
      {$pull: {dislikes: user._id}})
  }
}

const getTemplate = async(id) => {
  let [currentBlock] = await mongoose.models.block.find({_id:id},{origin:1, likes:1, dislikes:1})
  let currentOrigin = currentBlock.origin
  while(currentOrigin) {
    [currentBlock] = await mongoose.models.block.find({_id:currentOrigin},{origin:1, likes:1, dislikes:1})
    currentOrigin = currentBlock.origin
  }
  return currentBlock
}

module.exports={
  getBlockStatus, getBlockName, getSessionBlocks, setParentSession, 
  cloneTree, getAttribute, LINKED_ATTRIBUTES, onBlockFinished, onBlockCurrent, onBlockAction,
  getNextResource, getPreviousResource, getParentBlocks,LINKED_ATTRIBUTES_CONVERSION,
  ChainCache, ATTRIBUTES_CACHE,getSession, getBlockLiked, getBlockDisliked, setBlockLiked, setBlockDisliked
}


