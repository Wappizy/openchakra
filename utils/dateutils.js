const { RRule, RRuleSet, rrulestr }=require('rrule');
const {ALL_SERVICES, generate_id}=require('./consts.js');
const isEmpty = require('../server/validation/is-empty');
const moment=require('moment');

const DAYS=['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const dayToNumber = (day) => {
  const index= DAYS.indexOf(day);
  if (index==-1) { console.error(`${day} not found in ${DAYS}`)}
  return index;
}

const numberToDay = (number) => {
  if (number<0 || number>=DAYS.length) {
    console.error(`${number} out of bounds of ${JSON.stringify(DAYS)}`);
  }
  return DAYS[number];
}

const isMomentInEvent = (m, serviceId, event, checkTimeOnly) => {
  if (!event.all_services && !event.services.map(s => s.value).includes(serviceId)) {
    console.log(`ServiceId ${serviceId} not found in ${JSON.stringify(event.services)}`);
    return false;
  }
  
  const start=moment(event.begin);
  const end=moment(event.end);
  if (checkTimeOnly) {
    const eventStartTime=start.hour()*60+start.minutes();
    const eventEndTime=end.hour()*60+end.minutes();
    const momentTime=m.hour()*60+m.minutes();
    return (momentTime>=eventStartTime) && (momentTime<=eventEndTime);
  }
  else {
    return m.isAfter(start) && m.isBefore(end);
  }
}

const isMomentInAvail = (m, serviceId, avail) => {

  var period=false;
  // Check period
  if (avail['period'] && avail['period']['active']) {
    var period=true;
    const start=moment(avail.period.month_begin);
    const end=moment(avail.period.month_end);
    if (start.isValid() && m.isBefore(start, 'day')) { return false }
    if (end.isValid() && m.isAfter(end, 'day')) { return false }
  }

  // Check day
  const dayName=numberToDay(m.day());
  const events=avail[dayName]?avail[dayName].event:null;
  if (isEmpty(events)) {
    return false;
  } 
  // Test event. If in period, check only time
  return events.some( e => isMomentInEvent(m, serviceId, e, period));
}

const isMomentAvailable = (mom, serviceId, avails) => {
  if (isEmpty(avails)) { 
    console.log('isEmpty');
    return true;
  }
  const res= avails.some(a => isMomentInAvail(mom, serviceId, a));
  return res;
}

const isIntervalAvailable = (start, end, serviceId, avails) => {
  if (isEmpty(avails)) {
    return true;
  }
  console.log("Avails:"+avails.length);
  var m=moment(start);
  while (m.isBefore(end)) {
    if (isMomentAvailable(m, serviceId, avails)) { return true};
    m.add(15, 'minutes');
  }
  return false; 
}

module.exports={isMomentAvailable, isIntervalAvailable};
