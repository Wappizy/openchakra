const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const CustomerFreelance = require('../../server/models/CustomerFreelance')
const Question = require('../../server/models/Question')
const { CUSTOMER_DATA } = require('./data/base_data')
const { ROLE_ADMIN, SUSPEND_REASON, SUSPEND_REASON_INACTIVE } = require('../../server/plugins/sosynpl/consts')
const { suspendAccount } = require('../../server/plugins/sosynpl/actions')
require('../../server/plugins/sosynpl/functions')
require('../../server/models/Sector')
require('../../server/models/JobFile')
require('../../server/models/Job')

describe('Mailing', () => {

  beforeAll(async () => {
    const DBNAME = `test${moment().unix()}`
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must get question creator', async() => {
    const user = await CustomerFreelance.create({...CUSTOMER_DATA, email:'seghir.oumohand@wappizy.com'})
    const admin = await CustomerFreelance.create({...CUSTOMER_DATA, role:ROLE_ADMIN})
    await suspendAccount({value:user._id, reason:SUSPEND_REASON_INACTIVE},admin)
  })
})