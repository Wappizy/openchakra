const path = require('path')
const { exec } = require('child_process')
const { logFormFields, fillForm, savePDFFile, duplicateFields, allFieldsExist } = require('../../utils/fillForm')
const Quotation = require('../../server/models/Quotation')
const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const { StandardFonts } = require('pdf-lib')
const moment = require('moment')
const { fillQuotationDetails, QUOTATION_FIELDS } = require('../../server/plugins/sosynpl/quotation')
const { customerFreelancerBill, CF_BILL_FIELDS, CF_BILL_REQUIRED_FIELDS } = require('../../server/plugins/sosynpl/report')
const Report = require('../../server/models/Report')
const { REPORT_STATUS_ACCEPTED } = require('../../server/plugins/sosynpl/consts')
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
const FILEPATH = path.join(ROOT, 'sosynpl_quotation.pdf')
const FILEPATH2 = path.join(ROOT, 'template_bill_freelance_customer.pdf')

jest.setTimeout(300000)

describe('Fill form test', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/sosynpl`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {})

  it('must retrieve PDF fields', async () => {
    const fields = await logFormFields(FILEPATH)
    console.log(JSON.stringify(Object.keys(fields), null, 2))
  })

  it('must fill quotation document', async () => {
    const id = '668561c4f8aa59121b5cad40'
    const [quotation] = await loadFromDb({ model: 'quotation', id, fields: ['document']})
    const res = await exec(`xdg-open ${quotation.document}`)
  })

  it.only('must fill customerFreelance bill', async() => {
    const id = '6697b1c7203c34326ee54169'
    const [report] = await loadFromDb({model: 'report', id, fields: ['cf_billing']})
    const res = await exec(`xdg-open ${report.cf_billing}`)
  })
})
