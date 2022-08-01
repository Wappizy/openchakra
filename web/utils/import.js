const csv_parse = require('csv-parse/lib/sync')
const lodash=require('lodash')
const ExcelJS = require('exceljs')
const {JSON_TYPE, TEXT_TYPE, XL_TYPE} = require('./feurst/consts')
const {bufferToString} = require('./text')

const guessFileType = buffer => {
  return new Promise((resolve, reject) => {
    return new ExcelJS.Workbook().xlsx.load(buffer)
      .then(() => {
        return resolve(XL_TYPE)
      })
      .catch(() => {
        try {
          JSON.parse(buffer)
          return resolve(JSON_TYPE)
        }
        catch(err) {
          return Promise.reject(err)
        }
      })
      .catch(() => {
        return resolve(TEXT_TYPE)
      })
  })
}

const getTabs = buffer => {
  return new ExcelJS.Workbook().xlsx.load(buffer)
    .then(wb => {
      return wb.worksheets.map(w => w.name)
    })
}

const extractJSON=(bufferData, options) => {
  try {
    const data=JSON.parse(bufferData)
    if (options.columns) {
      const columns=lodash.flattenDeep(data.map(d => Object.keys(d)))
      return Promise.resolve({headers: columns, records: data})
    }
    const columns=lodash.flattenDeep(data.map(d => Object.keys(d)))
    const records=data.map(d => columns.map(c => d[c]))
    return Promise.resolve({headers: columns, records: records})
  }
  catch(err) {
    return Promise.reject(err)
  }
}

const extractCsv=(bufferData, options) => {
  if (!options.delimiter) {
    return Promise.reject(`CSV loading: missing options.delimiter`)
  }
  return new Promise((resolve, reject) => {
    const contents = bufferToString(bufferData)
    try {
      const opts={columns: true, bom: true, relax_column_count: true, ...options}
      const records=csv_parse(contents, opts)
      if (opts.columns) {
        const headers=Object.keys(records[0])
        resolve({headers: headers, records: records})
      }
      else {
        const headers=records[0]
        resolve({headers: headers, records: records.slice(1)})
      }
    }
    catch(err) {
      reject(err)
    }
  })
}

const extractXls=(bufferData, options) => {
  if (!options.tab) {
    return Promise.reject(`XLS loading: missing options.tab`)
  }
  return new ExcelJS.Workbook().xlsx.load(bufferData)
    .then(workbook => {
      const sheet=workbook.worksheets.find(w => w.name==options.tab)
      if (!sheet) {
        return Promise.reject(`XLS loading: sheet ${options.tab} not found`)
      }
      const first_line=options.from_line || 1
      const columnsRange=lodash.range(1, sheet.actualColumnCount+1)
      const rowsRange=lodash.range(first_line+1, sheet.actualRowCount+1)
      const headers=columnsRange.map(colIdx => sheet.getRow(first_line).getCell(colIdx).value)
      const records=rowsRange.map(rowIdx => columnsRange.map(colIdx => sheet.getRow(rowIdx).getCell(colIdx).value))
      if (!options.columns) {
        return {headers: headers, records: records}
      }
      let mappedRecords=records.map(r => Object.fromEntries(lodash.zip(headers, r)))
      return {headers: headers, records: mappedRecords}
    })
}

const extractData = (bufferData, options) => {
  const EXTRACTS={
    [XL_TYPE]: extractXls,
    [JSON_TYPE]: extractJSON,
    [TEXT_TYPE]: extractCsv,
  }
  if (!Object.keys(EXTRACTS).includes(options?.format)) {
    return Promise.reject(`Null or invalid options.format:${options.format}`)
  }
  options={columns: true, ...options}
  return EXTRACTS[options.format](bufferData, options)
}

const extractSample = (rawData, options) => {
  return extractData(rawData, {...options, columns: false})
    .then(({headers, records}) => {
      return [headers, ...records.slice(0, 4)]
    })
}

module.exports={extractData, guessFileType, getTabs, extractSample}
