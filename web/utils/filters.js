const geolib = require('geolib');
const isEmpty = require('../server/validation/is-empty');
const {createRegExpOR, createRegExpAND} = require('./text');
const {PRO, PART}=require('./consts')

const isServiceAroundGPS = (serviceUser, coordinates) => {

  const serviceGPS = serviceUser.service_address.gps;
  if (!serviceGPS) {
    console.warn('Incorect GPS in ' + serviceUser._id + ':' + JSON.stringify(serviceGPS));
    return false;
  } else {
    const latAlfred = serviceGPS.lat;
    const lngAlfred = serviceGPS.lng;
    if (isEmpty(latAlfred) || isEmpty(lngAlfred)) {
      console.warn('Incorrect GPS in ' + serviceUser._id + ':' + JSON.stringify(serviceGPS));
      return false;
    } else {
      // FIX : à vérifier
      /*const isNear = geolib.isPointWithinRadius({latitude: latUser, longitude: lngUser},{latitude:latAlfred,longitude:lngAlfred},(serviceUser.perimeter*1000));
      if(!isNear) {
      const removeIndex = service.findIndex(i => i._id == serviceUser._id);
      service.splice(removeIndex, 1);
      }*/
      try {
        const dist = geolib.getDistance(
          {latitude: coordinates.lat.toString(), longitude: coordinates.lng.toString()},
          {latitude: latAlfred.toString(), longitude: lngAlfred.toString()});
        var distance = geolib.convertDistance(dist, 'km');
        var in_perimeter = distance < serviceUser.perimeter;
        return in_perimeter;
      } catch (err) {
        console.error(`Error computing distance between ${JSON.stringify(coordinates)} and ${latAlfred}/${lngAlfred}:${err}`);
        return false;
      }
    }
  }
};

const isServiceAtAlfredOrVisio = su => {
  return su.location.alfred || su.location.visio;
};


const distanceComparator = gps => {
  const sort = (su1, su2) => {
    var d1, d2;
    try {
      d1 = geolib.getDistance(gps, su1.service_address.gps);
    } catch (e) {
      console.warn(`Warning: GPS incorrect pour serviceUser ${su1._id}:${e}`);
      d1 = 100000;
    }
    try {
      d2 = geolib.getDistance(gps, su2.service_address.gps);
    } catch (e) {
      console.warn(`Warning: GPS incorrect pour serviceUser ${su2._id}:${e}`);
      d2 = 100000;
    }
    return d1 - d2;
  };
  return sort;
};


const filterServicesGPS = (serviceUsers, coordinates, restrict) => {
  var filteredServiceUsers = serviceUsers.filter(su => isServiceAtAlfredOrVisio(su) || !restrict || isServiceAroundGPS(su, coordinates));
  filteredServiceUsers.sort(distanceComparator(coordinates));
  return filteredServiceUsers;
};

// Check ANDed words first, then ORed if not result
const filterServicesKeyword = (serviceUsers, keyword, status) => {
  const regExpFunctions = [createRegExpAND, createRegExpOR];

  const catLabel = status==PRO ? 's_professional_label' : 's_particular_label'
  for (i = 0; i < regExpFunctions.length; i++) {
    const regExpFn = regExpFunctions[i];
    const regexp = regExpFn(keyword);
    const filteredServices = serviceUsers.filter(su => {
      return regexp.test(su.service ? su.service.s_label : '') ||
        regexp.test(su.service ? su.service.category[catLabel] : '') ||
        su.prestations.some(p => p.prestation &&
          (regexp.test(p.prestation.s_label) ||
            (p.prestation.job && regexp.test(p.prestation.job.s_label))),
        );
    });
    if (filteredServices.length > 0) {
      return filteredServices;
    }
  }
  return [];
};

module.exports = {filterServicesGPS, filterServicesKeyword, distanceComparator};
