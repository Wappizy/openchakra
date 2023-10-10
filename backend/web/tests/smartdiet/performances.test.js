const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS, loadFromDb, getRequiredFields} = require('../../server/utils/database')
const {forceDataModelSmartdiet}=require('../utils')
forceDataModelSmartdiet()
require('../../server/plugins/smartdiet/functions')
const User=require('../../server/models/User')
require('../../server/models/Target')
require('../../server/models/UserQuizz')
require('../../server/models/Key')
require('../../server/models/Association')
require('../../server/models/Item')
require('../../server/models/Question')

jest.setTimeout(60000)

describe('Measure model ', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  const checkResult = users => {
    const user=users.find(u => /caro q/i.test(u.fullname))
    expect(user).toBeTruthy()
    console.log(user)
    expect(user.latest_coachings).toHaveLength(1)
    expect(user.latest_coachings[0].diet).toBeTruthy()
    expect(user.latest_coachings[0].diet.fullname).toEqual('Anne-Laure Meunier')
  }

  it('mongoose loading', async() => {
    console.time('DB')
    const users=await User.find({}, {fullname:1, lastname: 1, firstname: 1}).populate([
      {path: 'coachings', populate: {path: 'diet', select: ['firstname', 'lastname', 'fullname']}},
    ])
    checkResult(users)
    console.timeEnd('DB')
  })

  it.only('custom loading', async() => {
    console.time('Custom')
    //const required=getRequiredFields('user', ['fullname', 'company.name', 'latest_coachings.diet.fullname'])
    const required=getRequiredFields('user', ['fullname', 'company.name', 'latest_coachings.diet.fullname'])
    const EXPECTED_FIELDS=new Set(['lastname', 'firstname'])
    expect(new Set(required)).toEqual(EXPECTED_FIELDS)
    const populates=buildPopulates('user', ['fullname', 'company.name', 'latest_coachings.diet.fullname'])
    const EXPECTED_POPULATES=[
      {path: 'coachings', populate: {path: 'diet', select: ['firstname', 'lastname', 'fullname']}},
    ]
    expect(populates).toEqual(EXPECTED_POPULATES)
    const users=await loadFromDb({model: 'user', fields: ['fullname', 'company.name', 'latest_coachings.diet.fullname']})
    checkResult(users)
    console.timeEnd('Custom')
  })

})
