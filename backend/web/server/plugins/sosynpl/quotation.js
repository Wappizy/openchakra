const { duplicateFields, setFieldValue, fillForm, allFieldsExist, generateDocument } = require('../../../utils/fillForm')
const Quotation = require('../../models/Quotation')
const { ForbiddenError } = require('../../utils/errors')
const { QUOTATION_STATUS_SENT, QUOTATION_STATUS_DRAFT } = require('./consts')
const { StandardFonts } = require('pdf-lib')
const moment = require('moment')
const path = require('path')
const ROOT = path.join(__dirname, `../../../static/assets/pdf`)

const sendQuotation = async quotationId => {
  const quotation = await Quotation.findById(quotationId)
  if (quotation.status != QUOTATION_STATUS_DRAFT) {
    throw new ForbiddenError(`Ce devis a déjà été envoyé`)
  }
  quotation.status = QUOTATION_STATUS_SENT
  await quotation.save()
}

const QUOTATION_REQUIRED_FIELDS = [
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
  'ttc_customer_commission',
  'start_date'
]

const QUOTATION_FIELDS = [
  ...QUOTATION_REQUIRED_FIELDS,
  'status',
  'comments',
]


const getQuotationPDF = async(userId, params, data)  =>{
  if(!allFieldsExist(data, QUOTATION_REQUIRED_FIELDS)) {
    return null
  }

  if(data._document) {
    return data._document
  }

  const announce = data.application.announce
  const application = data.application

  const refactoredData = {
    applicationserialnumber: application.serial_number,
    announceserialnumber: announce.serial_number,
    applicationsentdate_af_date: moment(application.sent_date).format("DD/MM/YYYY"),
    freelanceshortname: application.freelance.shortname,
    companyname: announce.user.company_name,
    whyme: application.why_me,
    announcetitle: announce.title,
    announcestartdate_af_date: moment(announce.start_date).format("DD/MM/YYYY"),
    httotal: data.ht_total,
    tvatotal: data.vat_total,
    totalttc: data.ttc_total,
    quotationserialnumber: data.serial_number,
    applicationexpirationdate_af_date: moment(data.expiration_date).format("DD/MM/YYYY"),
    quotationdeliverables: data.deliverable,
    quotationdetail: data.detail,
    quotationcomments: data.comments || '',
    commissionttc: data.ttc_customer_commission,
    applicationstartdate_af_date: moment(data.start_date).format("DD/MM/YYYY"),
    quotationdetailsdescription: data.details.map(detail => ({
      quotationdetailsdescription: detail.label,
      rate: detail.price.toString(),
      days: detail.quantity.toString(),
      total: detail.ht_total.toString(),
      tva: detail.vat_rate.toString()
    }))
  }

  const TEMPLATE_NAME = 'sosynpl_quotation'
  const TEMPLATE_PATH = `${path.join(ROOT, TEMPLATE_NAME)}.pdf`
  const result = await generateDocument('quotation', 'quotation', '_document', TEMPLATE_PATH, TEMPLATE_NAME, refactoredData)

  return result
}

module.exports = {
  sendQuotation,
  getQuotationPDF,
  QUOTATION_FIELDS
}