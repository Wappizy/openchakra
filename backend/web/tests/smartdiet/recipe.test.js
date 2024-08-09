require('../../server/plugins/smartdiet/consts')
const moment = require('moment')
const {forceDataModelSmartdiet}=require('../utils')

forceDataModelSmartdiet()

require('../../server/plugins/smartdiet/functions')

const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS} = require('../../server/utils/database')

const MenuRecipe = require('../../server/models/MenuRecipe')
require('../../server/models/RecipeIngredient')
require('../../server/models/Ingredient')

describe('Measure model ', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must insert menuRecipe', async() => {
    return MenuRecipe.create({period: 0, day:2})
  })
})