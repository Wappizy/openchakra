const {RRule, RRuleSet, rrulestr} = require('rrule');
const {ALL_SERVICES, generate_id} = require('./consts.js');
const isEmpty = require('../server/validation/is-empty');
var moment = require('moment-timezone');
const {extendMoment} = require('moment-range');
moment = extendMoment(moment);

const {eventUI2availability} = require('./converters');
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const dayToNumber = (day) => {
  const index = DAYS.indexOf(day);
  if (index == -1) {
    console.error(`${day} not found in ${DAYS}`);
  }
  return index;
};

const numberToDay = (number) => {
  if (number < 0 || number >= DAYS.length) {
    console.error(`${number} out of bounds of ${JSON.stringify(DAYS)}`);
  }
  return DAYS[number];
};

const isMomentInEvent = (m, serviceId, event, checkTimeOnly) => {
  if (!event.all_services && !event.services.map(s => s.value).includes(serviceId)) {
    return false;
  }

  const start = moment(event.begin);
  const end = moment(event.end);
  if (checkTimeOnly) {
    const eventStartTime = start.hour() * 60 + start.minutes();
    const eventEndTime = end.hour() * 60 + end.minutes();
    const momentTime = m.hour() * 60 + m.minutes();
    return (momentTime >= eventStartTime) && (momentTime <= eventEndTime);
  } else {
    return m.isAfter(start) && m.isBefore(end);
  }
};

const isMomentInAvail = (m, serviceId, avail) => {

  var period = false;
  // Check period
  if (avail.period && avail.period.active) {
    var period = true;
    const start = moment(avail.period.month_begin);
    const end = moment(avail.period.month_end);
    if (start.isValid() && m.isBefore(start, 'day')) {
      return false;
    }
    if (end.isValid() && m.isAfter(end, 'day')) {
      return false;
    }
  }

  // Check day
  const dayName = numberToDay(m.day());
  const events = avail[dayName] ? avail[dayName].event : null;
  if (isEmpty(events)) {
    return false;
  }
  // Test event. If in period, check only time
  const res = events.some(e => isMomentInEvent(m, serviceId, e, period));
  return res;
};

const isMomentAvailable = (mom, avails) => {
  if (!moment.isMoment(mom)) {
    console.error(`Objet moment attendu: ${JSON.stringify(mmt)}`)
    return false
  }
  const availability=getAvailabilityForDate(mom, avails)
  if (!availability || !availability.available) {
    // 923772 : pas de dispos => toujours disponible
    return true
  }
  // Date is ok, check timelapses
  return availability.timelapses.includes(mom.hour())
};

const isIntervalAvailable = (start, end, serviceId, avails) => {
  if (!moment.isMoment(start)||!moment.isMoment(end)) {
    console.error(`Objet moment attendu:${JSON.stringify(start)}, ${JSON.stringify(end)}`)
    return false
  }

  if (isEmpty(avails)) {
    return true;
  }
  var m = start;
  while (start.isBefore(end)) {
    if (isMomentAvailable(m, avails)) {
      return true;
    }
    ;
    m.add(30, 'minutes');
  }
  return false;
};

const getDeadLine = (deadline) => {
  var m = moment();
  if (!deadline) {
    return m;
  }
  const dl = deadline.split(' ');
  var value = parseInt(dl[0]);
  const unit = dl[1];

  switch (unit) {
    case 'heures':
      m.add(value, 'hours');
      break;
    case 'jours':
      m.add(value, 'days');
      break;
    case 'semaines':
      m.add(value * 7, 'days');
      break;
    default:
      console.error('getDeadLine unité inconnue:' + unit);
  }
  return m;
};

const booking_datetime_str = booking => {
  return `Le ${booking.date_prestation} à ${moment(booking.time_prestation).tz('Europe/Paris').format('HH:mm')}`;
};

const getDefaultAvailability = () => {

  var start = moment().set({hour:1, minute:0, second:0});
  var end = moment(start).add(6, 'month')


  const avail = {
    period: {
      days: [0,1,2,3,4,5],
      begin: start,
      end: end,
    },
    timelapses: [9,10,11,12,13,14,15,16,17,18],
    available: true,
    punctual: null,
    available: true,
  };

  return avail;
};

// Check if mmt's date is event
const eventIncludesDate = (event, mmt) => {
  return moment(event.begin).format('DD/MM/YYYY') == mmt.format('DD/MM/YYYY');
};

const availIncludesDate = (avail, mmt) => {

  if (avail.is_punctual) {
    return moment(avail.punctual).isSame(mmt, 'day')
  }
  else {
    var range=moment.range(avail.period.begin, avail.period.end)
    if (!range.snapTo('day').contains(mmt)) {
      return false
    }
    const includedDay = avail.period.days.includes(mmt.isoWeekday()-1)
    return includedDay
  }
};

// Sort availabilities : punctuals before recurrent, then by reverse id ( same order as creation date)
const availabilitiesComparator = (a1, a2) => {
  // Punctual vs recurrent : punctual first
  if (a1.is_punctual != a2.is_punctual) {
    return a1.is_punctual ? -1 : 1
  }
  return a2._id.toString().localeCompare(a1._id.toString())
}

const getAvailabilityForDate = (mmt, availabilities) => {
  if (!availabilities || availabilities.length==0) {
    return null
  }
  const availability = availabilities.sort(availabilitiesComparator).find( avail => availIncludesDate(avail, mmt))
  return availability
}
/** Moment mmt's date is available for alfred_id => true/false */
const isDateAvailable = (mmt, availabilities) => {
  if (!moment.isMoment(mmt)) {
    console.error(`Objet moment attendu: ${JSON.stringify(mmt)}`)
    return false
  }
  if (!availabilities || availabilities.length == 0) {
    // 923772 : pas de dispos => toujours disponible
    return true;
  }
  const availability=getAvailabilityForDate(mmt, availabilities)
  return availability ? availability.available : false
}

/** Moment mmt's date contains at least one event for alfred_id => true/false */
const hasAlfredDateBooking = (mmt, bookings) => {
  return true;
};

/**
 Returns a timelapse containing true/false/null depending on input availabilities.
 For each timelapse, returns :
  - true if all input are true
  - false if all input are false
  - null if inputs differ
 */
const combineTimelapses = availabilities => {
  if (availabilities.length==0) {
    return Array.from({length:24}, () => false)
  }
  var timelapses = Array.from(Array(24).keys()).map( idx => availabilities[0].timelapses.includes(idx))
  availabilities.forEach( av => {
    timelapses.forEach( (value, idx) => {
      if (value!=av.timelapses.includes(idx)) {
        timelapses[idx]=null
      }
    })
  })
  return timelapses
}

// Converts [1,2,5] => [false, true, true, false, false, true, false...]
const timelapsesSetToArray = timelapses => {
  var result=Array.from({length:24}, (v, idx) => timelapses.includes(idx))
  return result
}

module.exports = {
  isMomentAvailable, isIntervalAvailable, getDeadLine, booking_datetime_str,
  getDefaultAvailability, isDateAvailable, hasAlfredDateBooking, DAYS,
  getAvailabilityForDate, combineTimelapses, timelapsesSetToArray
};
