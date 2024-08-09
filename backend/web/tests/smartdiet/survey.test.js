const {forceDataModelSmartdiet}=require('../utils')
forceDataModelSmartdiet()

require('../../server/plugins/smartdiet/functions')
require('../../server/plugins/smartdiet/consts')

const moment=require('moment')
const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS} = require('../../server/utils/database')

const Question=require('../../server/models/Question')
require('../../server/models/Key')

describe('Survey ', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must ensure question.order unicity', async() => {
    await Question.create({title: 'Title 1', picture: 'hop', order:1})
    await expect(Question.create({title: 'Title 2', picture: 'hop2', order:1})).rejects.toThrow(/duplicate/i);
  })
})