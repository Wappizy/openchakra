import getDistance from 'geolib/es/getDistance';
import convertDistance from 'geolib/es/convertDistance';
const jwt = require('jsonwebtoken')
const isEmpty = require('../server/validation/is-empty');
const moment = require('moment');

const computeDistanceKm = (latlon1, latlon2) => {
  if (isEmpty(latlon1) || isEmpty(latlon2)) {
    return null;
  }
  if (isEmpty(latlon1.lat) || isEmpty(latlon1.lng)) {
    return null;
  }
  if (isEmpty(latlon2.lat) || isEmpty(latlon2.lng)) {
    return null;
  }
  try {
    return convertDistance(
      getDistance(
        {latitude: latlon1.lat, longitude: latlon1.lng},
        {latitude: latlon2.lat, longitude: latlon2.lng},
      ),
      'km',
    );
  } catch (error) {
    console.log('Error:' + error);
    return null;
  }
};

const computeBookingReference = (user, alfred) => {
  var reference = user.avatar_letters + alfred.avatar_letters + '_' + moment().format('DDMMYYYY');
  return reference;
};

const computeAverageNotes = notes => {
  var res = {};
  if (isEmpty(notes)) {
    return res;
  }
  Object.keys(notes[0]).forEach(k => {
    const value = notes.reduce((prev, next) => prev + next[k], 0) / notes.length;
    res[k] = value;
  });
  return res;
};

const computeSumSkills = skills => {
  var res = {};
  if (isEmpty(skills)) {
    return res;
  }
  Object.keys(skills[0]).forEach(k => {
    const value = skills.reduce((prev, next) => prev + next[k], 0);
    res[k] = value;
  });
  return res;
};

const circular_get = (array, start, length) => {
  var index = start%array.length
  var res=[]
  while (res.length<length) {
    res.push(index)
    index = (index+1)%array.length
  }
  return res
}

const getLoggedUser = () => {
  if (typeof localStorage=='undefined') {
    console.log(`Token inconnnu, localStorage non défini`)
    return null
  }
  const token = localStorage.getItem('token')
  if (!token) {
    console.debug('Pas de token')
    return null
  }
  const data=token.split(' ')[1]
  const decoded = jwt.decode(data);
  return decoded
}

const getLoggedUserId = () => {
  const logged=getLoggedUser()
  return logged && logged.id
}

const isLoggedUserAdmin = () => {
  const logged=getLoggedUser()
  return logged && logged.is_admin
}

const isLoggedUserAlfred = () => {
  const logged=getLoggedUser()
  return logged && logged.is_alfred
}

// Returns true if user is the currently logged user
const isEditableUser = user => {
  if (!user || !getLoggedUserId()) {
    return false
  }
  const isEditable=getLoggedUserId()==user || getLoggedUserId()==user._id
  return isEditable
}

module.exports = {
  computeDistanceKm, computeBookingReference, computeAverageNotes,
  computeSumSkills, circular_get, getLoggedUserId,
  isLoggedUserAdmin, isEditableUser, isLoggedUserAlfred
};
