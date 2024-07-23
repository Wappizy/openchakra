{/*
    First
    node fillForm.js fieldStructure
    returns a table of field ids and their type (text or button)

    Then
    node fillForm.js fillForm sourcePath Data outputPath

*/}

const axios = require('axios')
const { PDFDocument } = require('pdf-lib')
const fs = require('fs').promises
const validator = require('validator')

async function getPDFBytes(filePath) {
  const isUrl = validator.isURL(filePath)
  if (isUrl) {
    const { data } = await axios.get(filePath, { responseType: 'arraybuffer' })
    return data
  }
  const pdf = await fs.readFile(filePath)
  return pdf.buffer
}

async function copyPDF(sourceLink) {
  const pdfBytes = await getPDFBytes(sourceLink)
  const pdf = await PDFDocument.load(pdfBytes)
  return pdf
}

async function logFormFields(sourceLink) {
  const sourcePDFBytes = await getPDFBytes(sourceLink)
  const sourcePDF = await PDFDocument.load(sourcePDFBytes)
  const form = sourcePDF.getForm()

  return Object.fromEntries(
    form.getFields().map(field => {
      const fieldName = field.getName()
      const fieldType = field.constructor.name
      const widgets = field.acroField.getWidgets()
      const positions = widgets.map(widget => {
        const rect = widget.getRectangle()
        const x = rect.x
        const y = rect.y
        const width = rect.width
        const height = rect.height
        return { x, y, width, height }
      })

      return [fieldName, { type: fieldType, positions }]
    })
  )
}

const setFieldValue = (form, field, value) => {
  const fieldType = field.constructor.name
  if (fieldType === 'PDFTextField') {
    const widgets = field.acroField.getWidgets()
    const rect = widgets[0].getRectangle()
    const fieldWidth = rect.width
    const charWidth = 5
    const maxLength = Math.floor(fieldWidth / charWidth)

    const wrapText = (text, maxLength) => {
      const lines = []
      let currentLine = ''

      for (let word of text.split(' ')) {
        if ((currentLine + word).length > maxLength) {
          lines.push(currentLine.trim())
          currentLine = word + ' '
        } else {
          currentLine += word + ' '
        }
      }

      lines.push(currentLine.trim())
      return lines
    }

    const wrappedLines = wrapText(value, maxLength)
    const wrappedValue = wrappedLines.join('\n')
    
    const lineHeight = 12; 
    const newHeight = wrappedLines.length * lineHeight
    rect.height = newHeight
    widgets.forEach(widget => widget.setRectangle(rect))
    field.enableMultiline()
    field.setText(wrappedValue)
  } else if (fieldType === 'PDFButton') {
    field.setImage(value)
  } else {
    console.warn(`Cannot set value for field type ${fieldType}`)
  }
}





async function fillForm(sourceLink, data) {
  const sourcePDFBytes = await getPDFBytes(sourceLink)
  const sourcePDF = await PDFDocument.load(sourcePDFBytes)
  const form = sourcePDF.getForm()
  
  Object.entries(data).forEach(([fieldName, fieldValue]) => {
    const field = form.getFieldMaybe(fieldName)
    if (!field) {
      return console.warn(`Found no field ${fieldName}`)
    }
    setFieldValue(form, field, fieldValue)
  })
  return sourcePDF
}

async function savePDFFile(pdf, outputFilePath) {
  const pdfBytes = await pdf.save()
  const buffer = Buffer.from(pdfBytes)
  await fs.writeFile(outputFilePath, buffer)
}

module.exports = {
  getPDFBytes,
  copyPDF,
  logFormFields,
  fillForm,
  savePDFFile,
}
