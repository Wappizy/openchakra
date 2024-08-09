require('../../server/models/Job')
require('../../server/models/DeclineReason')
require('../../server/models/JoinReason')
require('../../server/models/FoodDocument')
const mongoose = require('mongoose')

const {forceDataModelSmartdiet}=require('../utils')

forceDataModelSmartdiet()

require('../../server/plugins/smartdiet/functions')

const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const User = require('../../server/models/User')
const Coaching = require('../../server/models/Coaching')

jest.setTimeout(60000)

describe('Survey ', () => {


  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it('must get availabilities', async() => {
  })

  it.only('Must get available diet', async() => {
    const user=await User.findOne({email: 'hello+test@wappizy.com'})
    let coaching=await Coaching.findOne({user})
    coaching=(await loadFromDb({model: 'coaching', id:coaching._id, fields: ['available_diets']}))[0]
    console.log(coaching.available_diets.length)
  })
})