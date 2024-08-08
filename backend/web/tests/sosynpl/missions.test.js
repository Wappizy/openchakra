const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { ROLE_FREELANCE, ROLE_ADMIN, ROLE_CUSTOMER } = require('../../server/plugins/sosynpl/consts')
const { getCurrentMissions, getComingMissions } = require('../../server/plugins/sosynpl/missions')
const User = require('../../server/models/User')
const Mission = require('../../server/models/Mission')

describe('Missions', () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/sosynpl`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it.only('must return currentMissions', async () => {
    const customer = await User.findOne({role: ROLE_CUSTOMER})
    const freelance = await User.findOne({role: ROLE_FREELANCE})
    const admin = await User.findOne({role: ROLE_ADMIN})
    console.log(!!customer, !!freelance, !!admin)
    let current_missions_customer = await getCurrentMissions(customer)
    expect(current_missions_customer).toBeTruthy()
    let current_missions_admin = await getCurrentMissions(admin)
    
    expect(current_missions_admin).toBeTruthy()
    let current_missions_freelance = await getCurrentMissions(freelance)
    
    expect(current_missions_freelance).toBeTruthy()
  })
  it('must return comingMissions', async () => {
    const customer = await User.findOne({role: ROLE_CUSTOMER})
    const freelance = await User.findOne({_id: mongoose.Types.ObjectId(`6661adbaeb49ff38fc686de5`)})
    const admin = await User.findOne({role: ROLE_ADMIN})
    console.log(!!customer, !!freelance, !!admin)
    let coming_missions_customer = await getComingMissions(customer)
    
    expect(coming_missions_customer).toBeTruthy()
    let coming_missions_admin = await getComingMissions(admin)
    
    expect(coming_missions_admin).toBeTruthy()
    let coming_missions_freelance = await getComingMissions(freelance)
    
    expect(coming_missions_freelance).toBeTruthy()
  })
})