const moment = require('moment');
const momentTz = require('moment-timezone');

exports.formatDatetime = (str) => {
  if (moment(str, 'DD/MM/YYYY', true).isValid()) {
    return moment(str, 'DD/MM/YYYY', true).format();
  }
  if (moment(str, 'HH:mm DD/MM/YYYY', true).isValid()) {
    return moment(str, 'HH:mm DD/MM/YYYY', true).format();
  }
  if (moment(str, 'DD/MM/YYYY HH:mm', true).isValid()) {
    return moment(str, 'DD/MM/YYYY HH:mm', true).format();
  }
  if (moment(str, 'HH:mm:ss DD/MM/YYYY', true).isValid()) {
    return moment(str, 'HH:mm:ss DD/MM/YYYY', true).format();
  }
  if (moment(str, 'DD/MM/YYYY HH:mm:ss', true).isValid()) {
    return moment(str, 'DD/MM/YYYY HH:mm:ss', true).format();
  }
  if (moment(str, 'DD-MM-YYYY', true).isValid()) {
    return moment(str, 'DD-MM-YYYY', true).format();
  }
  if (moment(str, 'HH:mm DD-MM-YYYY', true).isValid()) {
    return moment(str, 'HH:mm DD-MM-YYYY', true).format();
  }
  if (moment(str, 'DD-MM-YYYY HH:mm', true).isValid()) {
    return moment(str, 'DD-MM-YYYY HH:mm', true).format();
  }
  if (moment(str, 'YYYY-MM-DD HH:mm', true).isValid()) {
    return moment(str, 'YYYY-MM-DD HH:mm', true).format();
  }
  if (moment(str, 'HH:mm:ss DD-MM-YYYY', true).isValid()) {
    return moment(str, 'HH:mm:ss DD-MM-YYYY', true).format();
  }
  if (moment(str, 'DD-MM-YYYY HH:mm:ss', true).isValid()) {
    return moment(str, 'DD-MM-YYYY HH:mm:ss', true).format();
  }
  return moment(str).format();
}

exports.formatVNDatetime = (str, outputFormat = '') => {
  return momentTz.tz(str, 'Asia/Ho_Chi_Minh').format(outputFormat);
}

exports.vnZone = (str) => {
  return momentTz.tz(str, 'Asia/Ho_Chi_Minh');
}

/**
 * Count number of Sundays and Saturdays
 * @param {String} fromDate Start of date/time
 * @param {String} toDate End of date/time
 * @returns integer
 */
exports.countWeekends = (fromDate, toDate) => {
  const Sun = 0, Sat = 6;
  let weekends = 0, start = moment(this.formatDatetime(fromDate)), end = moment(this.formatDatetime(toDate));
  while (start.isSameOrBefore(end)) {
    if (start.day() == Sun || start.day() == Sat) weekends++;
    start.add(1, 'day');
  }
  return weekends;
}

exports.customDatetimeFormat = (str, outputFormat) => {
  try {
    return momentTz(str).tz('Asia/Ho_Chi_Minh').format(outputFormat);
  } catch (error) {
    console.error(error);
    return str;
  }
}

/**
 * Compare 2 time fields
 * @param {String} time1 Format HH:mm
 * @param {String} time2 Format HH:mm
 * @param {Boolean} equal Compare equal
 * @returns {Boolean} Return true if time1 greater than time2 vice versa
 */
exports.compareGreaterTime = (time1, time2, equal = false) => {
  const rs = moment(time1, 'HH:mm').isAfter(moment(time2, 'HH:mm'));
  return equal ? (rs || time1 === time2) : rs;
}

/**
 * Compare 2 time fields
 * @param {String} time1 Format HH:mm
 * @param {String} time2 Format HH:mm
 * @param {Boolean} equal Compare equal
 * @returns {Boolean} Return true if time1 less than time2 vice versa
 */
exports.compareLessTime = (time1, time2, equal = false) => {
  const rs = moment(time1, 'HH:mm').isBefore(moment(time2, 'HH:mm'));
  return equal ? (rs || time1 === time2) : rs;
}

/**
 * 
 * @param {String} fromDate ISO_8601 format default
 * @param {String} toDate ISO_8601 format default
 * @returns {String}
 * @returns {String}
 * @returns {Boolean}
 */
exports.ceilBetweenDatetime = (fromDate, toDate, format = moment.ISO_8601, unit = 'day', precise = true) => {
  return Math.ceil(Math.abs(moment(toDate, format).diff(moment(fromDate, format), unit, precise)));
}
