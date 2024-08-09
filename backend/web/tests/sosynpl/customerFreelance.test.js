const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../../web/server/plugins/sosynpl/functions')
require('../../server/plugins/sosynpl/consts')
require('../../server/plugins/sosynpl/functions')
require('../../server/models/Sector')
require('../../server/models/Job')
require('../../server/models/Training')
require('../../server/models/Application')
require('../../server/models/JobFile')
require('../../server/models/Report')
require('../../server/models/Mission')
require('../../server/models/Quotation')

describe('Customer', () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/sosynpl`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('must return customer_applications', async () => {
    const id ='6661adbaeb49ff38fc686de5'
    const [user] = await loadFromDb({
      model: 'customerFreelance', id, fields: [
        'fullname',
        'customer_sent_reports_count',
        'customer_current_missions_count',
        'freelance_current_missions_count',
        'customer_coming_missions_count',
        'freelance_coming_missions_count',
        'customer_active_announces_count',
        'customer_published_announces_count',
        'customer_received_applications_count',
      ]
    })
    expect(user.customer_sent_reports_count).toBeGreaterThanOrEqual(0)
    expect(user.customer_current_missions_count).toBeGreaterThanOrEqual(0) 
    expect(user.freelance_current_missions_count).toBeGreaterThanOrEqual(0)
    expect(user.customer_coming_missions_count).toBeGreaterThanOrEqual(0) 
    expect(user.freelance_coming_missions_count).toBeGreaterThanOrEqual(0)
    expect(user.customer_active_announces_count).toBeGreaterThanOrEqual(0)
    expect(user.customer_published_announces_count).toBeGreaterThanOrEqual(0)
    expect(user.customer_received_applications_count).toBeGreaterThanOrEqual(0)
  })
})