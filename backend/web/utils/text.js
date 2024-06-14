const ced = require('ced')
const csv_string = require('csv-string')
const stripBom = require('strip-bom')
const moment=require('moment')
const lodash=require('lodash')
const externelFormatDuration=require('format-duration')
const levenshtein = require('fast-levenshtein')

const ARTICLES = 'le la les un une de des d l à'.split(/ /g)
const SIREN_LENGTH=9
const SIRET_LENGTH=14

const normalize = str => {
  str = str ? str.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : ''
  return str
}

// Escapes special characters for regex
const escapeText = txt => {
  return txt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const createRegExp = str => {
  str = escapeText(normalize(str)).split(/ |'/g)
  // Remove articles
  str = str.filter(s => !ARTICLES.includes(s))
  const regexp = new RegExp(str.join('|'), 'i')
  return regexp
}

const createRegExpAND = str => {
  str = escapeText(normalize(str)).split(/ |'/g)
  // Remove articles
  str = str.filter(s => !ARTICLES.includes(s))
  const regexp = new RegExp(str.map(s => `(?=.*${s})`).join(''), 'i')
  return regexp
}

const createRegExpOR = str => {
  str = escapeText(normalize(str)).split(/ |'/g)
  // Remove articles
  str = str.filter(s => !ARTICLES.includes(s))
  const regexp = new RegExp(str.map(s => `\\b${s}\\b`).join('|'), 'i')
  return regexp
}

const matches = (str, keywords) => {
  const regexps = createRegExp(keywords)
  const ok = regexps.test(str)
  return ok
}

const bufferToString = buff => {
  let encoding=ced(buff)
  if (encoding=='ASCII-7-bit') {
    encoding='UTF-8'
  }
  let text = buff.toString(encoding)
  // For MAC files
  text = stripBom(text)
  return text
}

const ILLEGAL_REGEX = /(O|0|\+33)[O\d \.,-]+\d|\S+@\S+|@\S+/

const hideIllegal = text => {
  if (text) {
    while (text.match(ILLEGAL_REGEX)) {
      text = text.replace(ILLEGAL_REGEX, '[Masqué]')
    }
  }
  return text
}

const compact = string => {
  const result = string.replace(/ /g, '')
  return result
}

const to_siren = siretOrSiret => {
  siretOrSiret = compact(siretOrSiret)
  if (siretOrSiret.length==SIREN_LENGTH) {
    return siretOrSiret
  }
  if (siretOrSiret.length==SIRET_LENGTH) {
    return siretOrSiret.slice(0, 9)
  }
  return ''
}

const computeVatNumber = siren => {
  if (!siren) {
    return ''
  }
  const siren_formatted = to_siren(siren)
  const siren_compact = compact(siren_formatted.toString())
  if (siren_compact.length!=9) {
    return ''
  }
  const siren_int = parseInt(`${siren_compact}12`)
  if (isNaN(siren_int)) {
    return ''
  }
  const siren_modulo = siren_int%97
  const result = `FR${siren_modulo.toString().padStart(2, '0')}${siren_compact}`
  return result
}

const capitalize = text => {
  return text ? text[0].toUpperCase()+text.slice(1).toLowerCase() : text
}

const guessDelimiter = text => {
  const delimiter=csv_string.detect(text.toString())
  return delimiter
}

const splitRemaining = (pattern, delimiter) => {
  if (lodash.isEmpty(pattern)) {
    return string
  }
  const [first, ...rest]=pattern.split(delimiter)
  return [first, rest.join(delimiter)]
}

const formatDateTime = datetime => {
  return `le ${formatDate(datetime)} à ${formatTime(datetime)}`
}

const formatDate = datetime => {
  return moment(datetime).format(`DD/MM/YY`)
}

const formatHour = datetime => {
  return moment(datetime).format(`HH:mm`)
}

const getWordsDistance = (word1, word2) => {
  return levenshtein.get(word1, word2)
}

const getNearestWord = (word, words, limit=undefined) => {
  const nearest=lodash(words).minBy(w => getWordsDistance(word, w))
  const distance=getWordsDistance(word, nearest)
  if (distance>limit) {
    console.error(`****** Too far\n${word}\n**** from\n${nearest}\n*** distance ${distance}`)
    return null
  }
  return nearest
}

const formatDuration = durationSeconds => {
  const hours=Math.floor(durationSeconds/3600)
  const minutes=Math.floor(durationSeconds%3600/60)
  const seconds=Math.floor(durationSeconds%60)
  if (durationSeconds==0)  {
    return '0s'
  }
  let result=''
  if (hours>0) {result+=`${hours}h`}
  if (minutes>0) {result+=`${hours ? lodash.padStart(minutes, 2, '0') : minutes}m`}
  if (seconds>0) {result+=`${hours || minutes ? lodash.padStart(seconds, 2, '0') : seconds}s`}
  return result
}

const convertDuration = value =>  {
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string') {
    const timeRegex = /^(\d{1,2}):(\d{2})$/
    const match = value.match(timeRegex)
    if (match) {
      const hours = parseInt(match[1], 10)
      const minutes = parseInt(match[2], 10)
      return hours * 3600 + minutes * 60
    }
    const parsedNumber = parseFloat(value);
    if (!isNaN(parsedNumber)) {
      return parsedNumber
    }
  }
}

/**
 * Sort object's keys accoring to the values, setting firstkey first
 * @throws Error if firstKey not found
 * */

const sortObject = (object, firstKey) => {
  let entries=lodash(object)
    .entries()
    .sortBy(([k,v ]) => normalize(v))
    .value()
  if (firstKey) {
    const firstEntry=entries.find(([k, v])=> k==firstKey)
    if (!firstEntry) {
      throw new Error(`Could not find key ${firstKey}`)
    }
    entries=[firstEntry, ...entries.filter(([k, v]) => k!=firstEntry)]
  }
  const result=Object.fromEntries(entries) 
  return result
} 

module.exports = {
  normalize,
  matches,
  createRegExpOR,
  createRegExpAND,
  bufferToString,
  hideIllegal,
  compact,
  computeVatNumber,
  capitalize,
  guessDelimiter,
  splitRemaining,
  formatDateTime, formatDate, formatHour,
  getWordsDistance, getNearestWord,
  formatDuration,
  convertDuration,
  sortObject,
}
