const path = require('path')
const { exec } = require('child_process')
const { logFormFields, fillForm, savePDFFile, duplicateFields } = require('../../utils/fillForm')
const Quotation = require('../../server/models/Quotation')
const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const { StandardFonts } = require('pdf-lib')
const moment = require('moment')
const { fillQuotationDetails } = require('../../server/plugins/sosynpl/quotation')
const { customerFreelancerBill } = require('../../server/plugins/sosynpl/report')
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
const FILEPATH2 = path.join(ROOT, 'template_bill_freelance_customer.pdf')

jest.setTimeout(300000)

describe('Fill form test', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/sosynpl`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {})

  it.only('must retrieve PDF fields', async () => {
    const fields = await logFormFields(FILEPATH2)
    console.log(JSON.stringify(Object.keys(fields), null, 2))
  })

  it('must fill quotation document', async () => {
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

  it.only('must fill customerFreelance bill', async() => {
    const id = '669e1660637d485cf01cb092'

    const fields= [
      'creation_date',
      'serial_number',

      'mission.title',
      'mission.serial_number',

      'mission.customer.fullname',
      'mission.customer.address',
      'mission.customer.siren',

      'mission.freelance.fullname',
      'mission.freelance.vat_number',
      'mission.freelance.address',
      'mission.freelance.company_name',
      'mission.freelance.siren',

      'quotation.comments',
      'quotation.deliverable',
      'quotation.ht_total',
      'quotation.ttc_customer_total',

      'quotation.details.label',
      'quotation.details.price',
      'quotation.details.quantity',
      'quotation.details.ht_total',
      'quotation.details.vat_rate'
    ]

    const [report] = await loadFromDb({model: 'report', id, fields})
    report.mission.freelance.vat_number = 123
    const filledPDF = await customerFreelancerBill(FILEPATH2, report)
    await savePDFFile(filledPDF, '/home/myalfred/bill.pdf')
    const res = await exec(`xdg-open /home/myalfred/bill.pdf`)
  })
})
