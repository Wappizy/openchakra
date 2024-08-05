const { BadRequestError } = require("../../utils/errors")
const moment=require('moment')
const Report = require('../../models/Report')
const { REPORT_STATUS, REPORT_STATUS_DRAFT, REPORT_STATUS_DISPUTE, REPORT_STATUS_SENT, REPORT_STATUS_ACCEPTED, REPORT_STATUS_PAID } = require("./consts")
const { loadFromDb } = require("../../utils/database")
const { fillForm, allFieldsExist, generateDocument } = require("../../../utils/fillForm")
const path = require('path')
const ROOT = path.join(__dirname, `../../../static/assets/pdf`)

// TODO: customer & freelance must have the required documents
const canAcceptReport = async reportId => {
  const report=await Report.findById(reportId)
  if (report.status!=REPORT_STATUS_SENT) {
    throw new BadRequestError(`Un rapport dans l'état ${REPORT_STATUS[report.status]} ne peut être accepté`)
  }
}

const acceptReport = async reportId => {
  const report=await Report.findById(reportId)
  report.accepted_date=moment()
  report.status=REPORT_STATUS_ACCEPTED
  return report.save()
}

const canRefuseReport = async reportId => {
  const report=await Report.findById(reportId)
  if (report.status!=REPORT_STATUS_SENT) {
    throw new BadRequestError(`Un rapport dans l'état ${REPORT_STATUS[report.status]} ne peut être refusé`)
  }
  return true
}

const refuseReport = async ({value, reason}) => {
  const report=await Report.findById(value)
  report.refuse_date=moment()
  report.refuse_reason=reason
  report.status=REPORT_STATUS_DISPUTE
  return report.save()
}

const canSendReport = async reportId => {
  const report=await Report.findById(reportId).populate({path: 'quotation', populate: 'details'})
  await report.validate()
  if (![REPORT_STATUS_DRAFT, REPORT_STATUS_DISPUTE].includes(report.status)) {
    throw new BadRequestError(`Un rapport dans l'état ${REPORT_STATUS[report.status]} ne peut être envoyé`)
  }
  if (!(report.quotation?.length>0)) {
    throw new BadRequestError(`Un rapport sans devis ne peut être envoyé`)
  }
  if (!(report.quotation[0].details.length>0)) {
    throw new BadRequestError(`Un rapport avec un devis incomplet ne peut être envoyé`)
  }
  return true
}

const sendReport = async reportId => {
  await Report.findByIdAndUpdate(reportId, {status: REPORT_STATUS_SENT, sent_date: moment()})
  // TODO: send bills : from sosynpl to customer & sosynpl to freelance for commissions, from freelance to customer
}

const CF_BILL_REQUIRED_FIELDS= [
  'creation_date',
  'serial_number',
  'cf_serial_number',
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
  'quotation.ht_total',
  'quotation.ttc_customer_total',
  'quotation.details.label',
  'quotation.details.price',
  'quotation.details.quantity',
  'quotation.details.ht_total',
  'quotation.details.vat_rate'
]

const CF_BILL_FIELDS= [
  ...CF_BILL_REQUIRED_FIELDS,
  'quotation.comments',
  'quotation.deliverable',
]

const canGenerateCFBill = (data) => {
  if(
    !(data.status == REPORT_STATUS_ACCEPTED || data.status == REPORT_STATUS_PAID)
    || !allFieldsExist(data, CF_BILL_REQUIRED_FIELDS)
  ) {
    return false
  }
  return true
}

const getCFBill = async (userId, params, data) => {
  console.log(data.mission.customer.id)
  // if(!canGenerateCFBill(data)) {
  //   return null
  // }

  if(data._cf_billing) {
    return data._cf_billing
  }

  const frAddr = data.mission.freelance.address
  const frAddrStr = `${frAddr.address}, ${frAddr.zip_code} ${frAddr.city}`

  const custAddr = data.mission.freelance.address
  const custAddrStr = `${custAddr.address}, ${custAddr.zip_code} ${custAddr.city}`

  const freelance = data.mission.freelance
  const customer = data.mission.customer
  const quotation = data.quotation[0]
  
  const refactoredData = {
    _id: data._id,
    _cf_billing: data._cf_billing,
    cf_serial_number: data.cf_serial_number,
    creation_date: moment(data.creation_date).format("DD/MM/YYYY"),
    mission_title: data.mission.title,
    mission_serial_number: data.mission.serial_number,

    customer_fullname: customer.fullname,
    customer_address : custAddrStr,
    customer_siren: customer.siren,

    freelance_fullname: freelance.fullname,
    freelance_vat_number: freelance.vat_number,
    freelance_address: frAddrStr,
    freelance_company_name: freelance.company_name,
    freelance_siren: freelance.siren,
    
    comments: quotation.comments,
    deliverable: quotation.deliverable,
    ht_total: quotation.ht_total,
    ttc_customer_total: quotation.ttc_customer_total,
    vattotal: quotation.vat_total,

    quotationdetailsdescription: quotation.details.map(detail => ({
      label: detail.label,
      price: detail.price.toString(),
      quantity: detail.quantity.toString(),
      qd_ht_total: detail.ht_total.toString(),
      vat_rate: detail.vat_rate.toString()
    }))
  }
  const TEMPLATE_NAME = 'sosynpl_customer_freelance_billing'
  const TEMPLATE_PATH = `${path.join(ROOT, TEMPLATE_NAME)}.pdf`
  const result = await generateDocument('report', 'billing', '_cf_billing', TEMPLATE_PATH, TEMPLATE_NAME, refactoredData)
  return result
}

module.exports = {
  canAcceptReport, acceptReport, canSendReport, sendReport, canRefuseReport, refuseReport, getCFBill, CF_BILL_FIELDS, CF_BILL_REQUIRED_FIELDS, 
}