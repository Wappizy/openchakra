const { duplicateFields, setFieldValue, fillForm } = require('../../../utils/fillForm')
const Quotation = require('../../models/Quotation')
const { ForbiddenError } = require('../../utils/errors')
const { QUOTATION_STATUS_SENT, QUOTATION_STATUS_DRAFT } = require('./consts')
const { StandardFonts } = require('pdf-lib')
const moment = require('moment')

const sendQuotation = async quotationId => {
  const quotation = await Quotation.findById(quotationId)
  if (quotation.status != QUOTATION_STATUS_DRAFT) {
    throw new ForbiddenError(`Ce devis a déjà été envoyé`)
  }
  quotation.status = QUOTATION_STATUS_SENT
  await quotation.save()
}

async function fillQuotationDetails(sourceLink, quotation) {
  const data = {
    applicationserialnumber: quotation.application.serial_number,
    announceserialnumber: quotation.application.announce.serial_number,
    applicationsentdate_af_date: moment(quotation.application.sent_date).format("DD/MM/YYYY"),
    freelanceshortname: quotation.application.freelance.shortname,
    companyname: quotation.application.announce.user.company_name,
    whyme: quotation.application.why_me,
    announcetitle: quotation.application.announce.title,
    announcestartdate_af_date: moment(quotation.application.announce.start_date).format("DD/MM/YYYY"),
    httotal: quotation.ht_total,
    tvatotal: quotation.vat_total,
    totalttc: quotation.ttc_total,
    quotationserialnumber: quotation.serial_number,
    applicationexpirationdate_af_date: moment(quotation.expiration_date).format("DD/MM/YYYY"),
    quotationdeliverables: quotation.deliverable,
    quotationdetail: quotation.detail,
    quotationcomments: quotation.comments || '',
    commissionttc: quotation.ttc_customer_commission,
    applicationstartdate_af_date: moment(quotation.start_date).format("DD/MM/YYYY"),
    quotationdetailsdescription: quotation.details.map(detail => ({
      quotationdetailsdescription: detail.label,
      rate: detail.price.toString(),
      days: detail.quantity.toString(),
      total: detail.ht_total.toString(),
      tva: detail.vat_rate.toString()
    }))
  }

  return fillForm(sourceLink, data)
}

module.exports = {
  sendQuotation,
  fillQuotationDetails
}