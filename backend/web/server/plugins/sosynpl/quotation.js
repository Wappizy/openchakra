const { StandardFonts } = require('pdf-lib')
const { duplicateFields, setFieldValue } = require('../../../utils/fillForm')
const Quotation = require('../../models/Quotation')
const { ForbiddenError } = require('../../utils/errors')
const { QUOTATION_STATUS_SENT, QUOTATION_STATUS_DRAFT } = require('./consts')

const sendQuotation = async quotationId => {
  const quotation = await Quotation.findById(quotationId)
  if (quotation.status != QUOTATION_STATUS_DRAFT) {
    throw new ForbiddenError(`Ce devis a déjà été envoyé`)
  }
  quotation.status = QUOTATION_STATUS_SENT
  await quotation.save()
}

async function fillQuotationDetails(sourceLink, quotation) {
  const textFields = ['description', 'rate', 'days', 'total', 'tva']
  const numberOfDuplicates = quotation.details.length
  const pdf = await duplicateFields(sourceLink, textFields, numberOfDuplicates, 0, 10)

  const form = pdf.getForm()
  quotation.details.forEach((detail, index) => {
    const fieldIndex = index + 1
    const descriptionField = form.getTextField(`description_copy_${fieldIndex}`)
    const rateField = form.getTextField(`rate_copy_${fieldIndex}`)
    const daysField = form.getTextField(`days_copy_${fieldIndex}`)
    const totalField = form.getTextField(`total_copy_${fieldIndex}`)
    const tvaField = form.getTextField(`tva_copy_${fieldIndex}`)

    if (descriptionField) setFieldValue(form, descriptionField, detail.label, StandardFonts.Helvetica, 12)
    if (rateField) rateField.setText(detail.price.toString())
    if (daysField) daysField.setText(detail.quantity.toString())
    if (totalField) totalField.setText(detail.ht_total.toString())
    if (tvaField) tvaField.setText(detail.vat_rate.toString())
  })

  form.flatten()
  return pdf
}

module.exports = {
  sendQuotation,
  fillQuotationDetails
}