const {createHmac} = require('crypto')
const axios = require('axios')
const moment = require('moment')
const lodash = require('lodash')
const {GENDER, GENDER_MALE} = require('../plugins/dekuple/consts')
const {getWithingsConfig} = require('../../config/config')

const wConfig=getWithingsConfig()

const NONCE_DOMAIN='https://wbsapi.withings.net/v2/signature'
const SDK_DOMAIN='https://wbsapi.withings.net/v2/sdk'
const OAUTH2_DOMAIN='https://wbsapi.withings.net/v2/oauth2'


const generateTSSignature=({action, clientId, clientSecret, timestamp}) => {
  const signatureStr=`${action},${clientId},${timestamp}`
  const hashedSignature=createHmac('sha256', clientSecret).update(signatureStr).digest('hex')
  return hashedSignature
}

const generateNonceSignature=({action, clientId, clientSecret, nonce}) => {
  const signatureStr=`${action},${clientId},${nonce}`
  const hashedSignature=createHmac('sha256', clientSecret).update(signatureStr).digest('hex')
  return hashedSignature
}

/** ***

ALL API https://developer.withings.com/api-reference/#operation/oauth2-listusers
*/

const getNonce = () => {

  const timestamp=moment().unix()
  const action='getnonce'
  const hashedSignature=generateTSSignature({action, clientId: wConfig.clientId, clientSecret: wConfig.clientSecret, timestamp})

  const body={
    action, client_id: wConfig.clientId, timestamp, signature: hashedSignature,
  }

  return axios.post(NONCE_DOMAIN, body)
    .then(res => {
      const nonce=res.data.body.nonce
      return nonce
    })
}

// From https://developer.withings.com/sdk/v2/tree/sdk-webviews/required-web-services#user-creation-api
const createUser = user => {

  // Validate user data
  const VALIDS={
    birthday: v => moment(v).isValid(),
    height: v => lodash.inRange(v, 10, 300),
    weight: v => lodash.inRange(v, 1, 600),
    gender: v => Object.keys(GENDER).includes(v),
    email: v => !!v,
    firstname: v => v?.toString().trim().length>0,
    lastname: v => v?.toString().trim().length>0,
  }

  const errors=Object.entries(VALIDS).filter(([att, fn]) => !fn(lodash.get(user, att))).map(([att]) => att)
  if (errors.length>0) {
    return Promise.reject(`Invalid user fields:${errors.join(',')}`)
  }

  const action='createuser'

  return getNonce()
    .then(nonce => {
      const hashedSignature=generateNonceSignature({action, clientId: wConfig.clientId, clientSecret: wConfig.clientSecret, nonce})

      const measures=JSON.stringify([{value: user.height, unit: -2, type: 4}, {value: user.weight, unit: 0, type: 1}])
      const shortname=[user.firstname[0], user.lastname.slice(0, 2)].map(s => s.toUpperCase()).join('')
      const gender=user.gender==GENDER_MALE ? 0:1
      const birthdate=moment(user.birthday).unix().toString()

      const body={
        action, client_id: wConfig.clientId, nonce, signature: hashedSignature,
        birthdate, measures, gender, shortname, email: user.email,
        firstname: user.firstname, lastname: user.lastname,
        mailingpref: 0, preflang: 'fr_FR', timezone: 'Europe/Paris',
        unit_pref: JSON.stringify({weight: 1, height: 6, distance: 6, temperature: 11}),
        external_id: 'Tensiometre dev',
      }

      return axios.post(SDK_DOMAIN, body)
    })
    .then(res => {
      if (res.data.status!=0) {
        throw new Error(JSON.stringify(res.data))
      }
      return res.data.body.user.code
    })
    .catch(err => {
      console.error(err)
      throw err
    })

}

const getAccessToken = usercode => {

  const body={
    action: 'requesttoken',
    client_id: wConfig.clientId, client_secret: wConfig.clientSecret,
    grant_type: 'authorization_code', code: usercode, redirect_uri: 'https://dekuple.my-alfred.io',
  }

  return axios.post(OAUTH2_DOMAIN, body)
    .then(res => {
      if (res.data.status!=0) {
        return Promise.reject(JSON.stringify(res.data))
      }
      return res.data.body
    })
    .catch(err => {
      console.error(err)
      throw err
    })
}

const getFreshAccessToken = refreshToken => {

  const body={
    action: 'requesttoken',
    client_id: wConfig.clientId, client_secret: wConfig.clientSecret,
    grant_type: 'refresh_token', refresh_token: refreshToken,
  }

  return axios.post(OAUTH2_DOMAIN, body)
    .then(res => {
      if (res.data.status!=0) {
        throw new Error(JSON.stringify(res.data))
      }
      return res.data.body
    })
    .catch(err => {
      console.error(err)
      throw err
    })
}

// From https://developer.withings.com/api-reference/#operation/oauth2-listusers
const getUsersList = () => {
  return Promise.reject('Not implemented')
}

module.exports={
  getNonce,
  createUser,
  getAccessToken,
  getFreshAccessToken,
}
