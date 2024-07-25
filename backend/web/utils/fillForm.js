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

const setFieldValue = (form, field, value, font, fontSize) => {
  const fieldType = field.constructor.name
  if (fieldType === 'PDFTextField') {
    field.enableMultiline()
    const widgets = field.acroField.getWidgets()
    const rect = widgets[0].getRectangle()
    const fieldWidth = rect.width

    const charWidth = fontSize * 0.5

    const wrapText = (text, fieldWidth, charWidth) => {
      const words = text.split(' ')
      let lines = []
      let currentLine = ''

      words.forEach((word) => {
        const testLine = currentLine + (currentLine.length ? ' ' : '') + word
        const textWidth = testLine.length * charWidth

        if (textWidth <= fieldWidth) {
          currentLine = testLine
        } else {
          lines.push(currentLine)
          currentLine = word
        }
      })

      lines.push(currentLine)
      return lines
    }

    const wrappedLines = wrapText(value, fieldWidth, charWidth)
    const wrappedValue = wrappedLines.join('\n')

    const lineHeight = fontSize * 1.2
    const requiredHeight = wrappedLines.length * lineHeight + lineHeight

    rect.y -= (requiredHeight - rect.height)
    rect.height = requiredHeight
    widgets.forEach(widget => widget.setRectangle(rect))

    field.setText(wrappedValue)
  } else if (fieldType === 'PDFButton') {
    field.setImage(value)
  } else {
    console.warn(`Cannot set value for field type ${fieldType}`)
  }
}

async function fillForm(sourceLink, data, font, fontSize) {
  const sourcePDFBytes = await getPDFBytes(sourceLink)
  const sourcePDF = await PDFDocument.load(sourcePDFBytes)
  const pdfFont = await sourcePDF.embedFont(font)
  const form = sourcePDF.getForm()

  Object.entries(data).forEach(([fieldName, fieldValue]) => {
    const field = form.getFieldMaybe(fieldName)
    if (!field) {
      return console.warn(`Found no field ${fieldName}`)
    }
    setFieldValue(form, field, fieldValue, pdfFont, fontSize)
  })

  form.updateFieldAppearances(pdfFont)
  form.flatten()
  return sourcePDF
}

async function savePDFFile(pdf, outputFilePath) {
  const pdfBytes = await pdf.save()
  const buffer = Buffer.from(pdfBytes)
  await fs.writeFile(outputFilePath, buffer)
}

async function duplicateFields(sourceLink, textFields, numberOfDuplicates = 1, pageNumber = 0, margin = 10) {
  const sourcePDFBytes = await getPDFBytes(sourceLink)
  const sourcePDF = await PDFDocument.load(sourcePDFBytes)
  const form = sourcePDF.getForm()
  const fieldMap = Object.fromEntries(
    form.getFields().map(field => {
      const fieldName = field.getName()
      const fieldType = field.constructor.name
      const widgets = field.acroField.getWidgets()
      const positions = widgets.map(widget => {
        const rect = widget.getRectangle()
        const appearance = widget.getDefaultAppearance()
        const x = rect.x
        const y = rect.y
        const width = rect.width
        const height = rect.height
        return { x, y, width, height, appearance }
      })
      return [fieldName, { type: fieldType, positions }]
    })
  )

  const originalPage = sourcePDF.getPage(pageNumber)
  const pageHeight = originalPage.getHeight()

  for (let i = 0; i < numberOfDuplicates; i++) {
    let currentPage = originalPage
    let yOffset = 0

    for (const fieldName of textFields) {
      const { type, positions } = fieldMap[fieldName]
      const { x, y, width, height, appearance } = positions[0]
      let newY = y - yOffset - (height + margin) * i

      if (newY < 0) {
        currentPage = sourcePDF.addPage([originalPage.getWidth(), pageHeight])
        newY = pageHeight - (height + margin)
        yOffset = 0
      }

      const newFieldName = `${fieldName}_copy_${i + 1}`
      let newField

      if (type === 'PDFTextField') {
        newField = form.createTextField(newFieldName)
        newField.setText('')
      } else if (type === 'PDFButton') {
        newField = form.createButton(newFieldName)
      }

      newField.addToPage(currentPage, { x, y: newY, width, height, borderWidth: 0 })
      const widgets = newField.acroField.getWidgets()
      widgets.forEach(widget => {
        widget.setDefaultAppearance(appearance)
      })
    }
  }

  return sourcePDF
}

module.exports = {
  getPDFBytes,
  copyPDF,
  logFormFields,
  fillForm,
  savePDFFile,
  duplicateFields,
  setFieldValue
}
