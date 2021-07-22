const geolib = require('geolib')
const isEmpty = require('../validation/is-empty')
const {createRegExpOR, createRegExpAND} = require('../../utils/text')
const {PRO, PART}=require('../../utils/consts')
const {normalize}=require('../../utils/text')

const isServiceAroundGPS = (serviceUser, coordinates) => {

  const serviceGPS = serviceUser.service_address.gps
  if (!serviceGPS) {
    console.warn('Incorect GPS in ' + serviceUser._id + ':' + JSON.stringify(serviceGPS))
    return false
  } else {
    const latAlfred = serviceGPS.lat
    const lngAlfred = serviceGPS.lng
    if (isEmpty(latAlfred) || isEmpty(lngAlfred)) {
      console.warn('Incorrect GPS in ' + serviceUser._id + ':' + JSON.stringify(serviceGPS))
      return false
    } else {
      // FIX : à vérifier
      /*const isNear = geolib.isPointWithinRadius({latitude: latUser, longitude: lngUser},{latitude:latAlfred,longitude:lngAlfred},(serviceUser.perimeter*1000))
      if(!isNear) {
      const removeIndex = service.findIndex(i => i._id == serviceUser._id)
      service.splice(removeIndex, 1)
      }*/
      try {
        const dist = geolib.getDistance(
          {latitude: coordinates.lat.toString(), longitude: coordinates.lng.toString()},
          {latitude: latAlfred.toString(), longitude: lngAlfred.toString()})
        var distance = geolib.convertDistance(dist, 'km')
        var in_perimeter = distance < serviceUser.perimeter
        return in_perimeter
      } catch (err) {
        console.error(`Error computing distance between ${JSON.stringify(coordinates)} and ${latAlfred}/${lngAlfred}:${err}`)
        return false
      }
    }
  }
}

const isServiceAtAlfredOrVisio = su => {
  return su.location.alfred || su.location.visio
}


const distanceComparator = gps => {
  const sort = (su1, su2) => {
    let d1, d2
    try {
      d1 = geolib.getDistance(gps, su1.service_address.gps)
    }
    catch (e) {
      console.warn(`Warning: GPS incorrect pour serviceUser ${su1._id}:${e}`)
      d1 = 100000
    }
    try {
      d2 = geolib.getDistance(gps, su2.service_address.gps)
    }
    catch (e) {
      console.warn(`Warning: GPS incorrect pour serviceUser ${su2._id}:${e}`)
      d2 = 100000
    }
    return d1 - d2
  }
  return sort
}


const filterServicesGPS = (serviceUsers, coordinates, restrict) => {
  let filteredServiceUsers = serviceUsers.filter(su => isServiceAtAlfredOrVisio(su) || !restrict || isServiceAroundGPS(su, coordinates))
  filteredServiceUsers.sort(distanceComparator(coordinates))
  return filteredServiceUsers
}

// Check ANDed words first, then ORed if not result
const filterServicesKeyword = (serviceUsers, keyword, status) => {
  const regExpFunctions = [createRegExpAND, createRegExpOR]
  const catLabel = status==PRO ? 's_professional_label' : 's_particular_label'
  // On recherche d'abord avec un AND des mots-clés
  // Si pas de résultats, on passe au OR
  for (i = 0; i < regExpFunctions.length; i++) {
    const regExpFn = regExpFunctions[i]
    const regexp = regExpFn(keyword)
    const filteredServices = serviceUsers.filter(su => {
      return regexp.test(su.service && su.service.s_label) ||
        regexp.test(su.service && su.service.category && su.service.category[catLabel]) ||
        regexp.test(normalize(su.service && su.service.description)) ||
        regexp.test(normalize(su.description)) ||
        su.prestations.some(p => p.prestation &&
          (regexp.test(p.prestation.s_label) ||
           regexp.test(normalize(p.prestation.description)) ||
           regexp.test(p.prestation.job && p.prestation.job.s_label)),
        )
    })
    if (filteredServices.length > 0) {
      return filteredServices
    }
  }
  return []
}

const filterServicesIds = (sus, serviceids) => {
  return sus.filter(su => serviceids.includes(su.service._id))
}

// For non admin, remove prestations linked to companies
// Then remove services having no prestation
const filterPartnerServices = (sus, admin) => {
  if (admin) {
    return sus
  }
  sus = sus.map(su => {
    su.prestations = su.prestations.filter(p => {
      // TODO : pourquoi j'ai des prestas à null ?
      if (!p.prestation) {
        console.error(`Missing prestations.prestation for serviceUser #${su._id}`)
      }
      return p && p.prestation && !p.prestation.private_company
    })
    return su
  })
    .filter(su => su.prestations.length>0)
  return sus
}

module.exports = {
  filterServicesGPS, filterServicesKeyword, distanceComparator,
  filterServicesIds, filterPartnerServices}
