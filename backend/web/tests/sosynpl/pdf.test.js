const path = require('path')
const { exec } = require('child_process')
const { logFormFields, fillForm, savePDFFile, duplicateFields } = require('../../utils/fillForm')
const Quotation = require('../../server/models/Quotation')
const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const { StandardFonts } = require('pdf-lib')
const moment = require('moment')
const { fillQuotationDetails } = require('../../server/plugins/sosynpl/quotation')
require('../../server/plugins/sosynpl/functions')
require('../../server/models/Sector')
require('../../server/models/Job')
require('../../server/models/Training')
require('../../server/models/Application')
require('../../server/models/Report')
require('../../server/models/JobFile')
require('../../server/models/QuotationDetail')
require('../../server/models/Announce')

const ROOT = path.join(__dirname, './../data/pdf')
const FILEPATH = path.join(ROOT, 'template.pdf')

jest.setTimeout(300000)

describe('Fill form test', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/sosynpl`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {})

  it('must retrieve PDF fields', async () => {
    const fields = await logFormFields(FILEPATH)
    console.log(JSON.stringify(fields, null, 2))
  })

  it.only('must fill document', async () => {
    const id = '668561c4f8aa59121b5cad40'
    const [quotation] = await loadFromDb({ model: 'quotation', id, fields: [
      'details.label',
      'details.quantity',
      'details.price',
      'details.vat_rate',
      'details.ht_total',
      'application.serial_number',
      'application.announce.serial_number',
      'application.sent_date',
      'application.freelance.shortname',
      'application.announce.user.company_name',
      'application.why_me',
      'application.announce.title',
      'application.announce.start_date',
      'ht_total',
      'vat_total',
      'ttc_total',
      'serial_number',
      'expiration_date',
      'deliverable',
      'detail',
      'comments',
      'ttc_customer_commission',
      'start_date'
    ] })
    const filledPDF = await fillQuotationDetails(FILEPATH, quotation)
    await savePDFFile(filledPDF, '/home/myalfred/test_duplicate_and_fill.pdf')
    const res = await exec(`xdg-open /home/myalfred/test_duplicate_and_fill.pdf`)
  })
})
