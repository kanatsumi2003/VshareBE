const moment = require('moment');
const momentTz = require('moment-timezone');
const { isObject, isArray } = require("./CommonUtil");

exports.formatPhone0x = (str) => {
  try {
    let phone = str.toString()
    phone = phone.trim()
    phone = phone.replace('+', '')
    phone = phone.replace(/^(840)/, 0)
    phone = phone.replace(/^(84)/, 0)
    return phone
  } catch (error) {
    console.error(error);
  }
}

exports.formatNumber = (value, unit = '', suffix = '.') => {
  try {
    const re = '\\d(?=(\\d{3})+$)';
    return value.toString().replace(new RegExp(re, 'g'), `$&${suffix}`) + `${unit || ''}`;
  } catch (error) {
    return value;
  }
}

exports.formatVND = (amount) => this.formatNumber(amount, 'đ', '.')

exports.formatListItemOutput = (value1, value2) => {
  if (value1 != value2) {
    return `${value1 || '_'}\n${value2 || '_'}`
  }
  return value1;
}

/**
 * Convert 1y2m10d to 1năm 2tháng 10ngày
 */
exports.formatDuration = (duration) => {
  try {
    if (/[ymd]/.test(duration)) {
      return duration.match(/[0-9]+[a-z]/g).map(str => str.indexOf('d') > 0 ? str.replace('d', 'ngày') : str.indexOf('m') > 0 ? str.replace('m', 'tháng') : str.indexOf('y') > 0 ? str.replace('y', 'năm') : str).join(' ');
    }
    return `${Number(duration)}ngày`;
  } catch (e) {
    return '';
  }
}

exports.formatDurationToDays = (duration) => {
  try {
    if (/[ymd]/.test(duration)) {
      return duration.match(/[0-9]+[a-z]/g)
        .reduce((total, str) => total + (str.indexOf('d') > 0 ? (str.replace('d', '')) : str.indexOf('m') > 0 ? str.replace('m', '') * 30 : str.indexOf('y') > 0 ? str.replace('y', '') * 365 : str), 0)
    }
    return Number(duration);
  } catch (e) {
    return duration;
  }
}
exports.formatDatetimeOutput = (obj, outputFormat = 'YYYY-MM-DD HH:mm') => {
  if (isObject(obj)) {
    Object.entries(obj).forEach(([k, v]) => {
      if (moment(v, moment.ISO_8601, true).isValid() && !moment(v, "YYYY-MM-DD", true).isValid()) {
        obj[k] = momentTz.tz(v, 'Asia/Ho_Chi_Minh').format(outputFormat);
      }
      else if (isArray(v)) {
        obj[k] = v.map(v1 => this.formatDatetimeOutput(v1))
      }
    });
  }
  return obj;
}