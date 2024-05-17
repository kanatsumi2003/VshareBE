/* eslint-disable indent */
'use strict';

const moment = require('moment');
const Op = require("sequelize").Op;
const db = require('../models');
const DateUtil = require('../utils/DateUtil');
const BranchVehicleService = require('./BranchVehicleService');

/**
 * Get estimate price detail by params
 * @param {int} branchVehicleId branch_vehicle model id
 * @param {String} receiveAt receive vehicle time, format YYYY-MM-DD HH:mm or YYYY-MM-DD'T'HH:mm:ss.ssZ
 * @param {String} returnAt return vehicle time, format YYYY-MM-DD HH:mm or YYYY-MM-DD'T'HH:mm:ss.ssZ
 * Return integer
 */
exports.getEstimatePriceDetail = async (branchVehicleId, receiveAt, returnAt) => {
  try {
    const branchVehicle = await BranchVehicleService.getById(branchVehicleId);
    if (!branchVehicle) return;

    // 7-19h Cần tính lại thời gian bắt đầu & kết thúc
    let receiveDatetime = receiveAt, returnDatetime = returnAt;
    if (moment(receiveDatetime, 'YYYY-MM-DD HH:mm', true).isValid()) {
      receiveDatetime = moment(receiveDatetime, 'YYYY-MM-DD HH:mm', true).format();
    }
    if (moment(returnDatetime, 'YYYY-MM-DD HH:mm', true).isValid()) {
      returnDatetime = moment(returnDatetime, 'YYYY-MM-DD HH:mm', true).format();
    }

    const result = {
      totalPrice: 0,      // Total amount
      monthPrice: 0,      // Total amount of months
      basePrice: 0,       // Total amount of weekdays
      weekendPrice: 0,    // Total amount of weekends
      pricePerWeekday: branchVehicle.customer_base_price,      // Price per one weekday
      pricePerWeekend: branchVehicle.customer_weekend_price,  // Price per one weekend
      pricePerMonth: branchVehicle.customer_month_price,      // Price per one month
      months: 0,          // Number of months between two dates
      weekdays: 0,        // Number of weekdays 
      weekends: 0,        // Number of weekends (both Sun & Sat)
      duration: [],
    }

    // Calcuate by customer_day_price_rule
    const totalDurationDays = Math.ceil(moment(returnDatetime).diff(moment(receiveDatetime), 'days', true));
    result.weekends = DateUtil.countWeekends(receiveDatetime, returnDatetime);
    result.weekdays = totalDurationDays - result.weekends;

    const rulePrice = await getPriceByRule(branchVehicleId, totalDurationDays);
    if (rulePrice) {
      result.pricePerWeekday = rulePrice > 100 ? rulePrice : (rulePrice / 100 * branchVehicle.customer_day_price);
    }
    else {
      result.months = Math.floor(moment(returnDatetime).diff(moment(receiveDatetime), 'months', true));
      // Is rental vehicle by month
      if (result.months > 0) {
        const calcDayPriceFrom = moment(receiveDatetime).add(result.months, 'months');
        const durationDays = Math.ceil(moment(returnDatetime).diff(calcDayPriceFrom, 'days', true));
        result.weekends = DateUtil.countWeekends(calcDayPriceFrom.format(), returnDatetime);
        result.weekdays = durationDays - result.weekends;
      }
    }
    console.log(result);
    result.monthPrice = result.pricePerMonth * result.months;
    result.basePrice = result.pricePerWeekday * result.weekdays;
    result.weekendPrice = result.pricePerWeekend * result.weekends;
    result.totalPrice = result.monthPrice + result.basePrice + result.weekendPrice;
    result.duration.push(result.weekends + result.weekdays);

    if (result.months) {
      result.duration[0] += 'd'
      result.duration.push(`${result.months}m`)
      result.duration = result.duration.join('')
    }
    else {
      result.duration = result.duration[0];
    }

    return result;
  } catch (err) {
    console.error(err);
    throw 'Hệ thống đang bận. Không thể tính phí.';
  }
}

exports.calculatePrice = (data) => {
  const {
    receive_datetime,
    return_datetime,
    base_price,
    weekend_price,
    overtime_price,
    has_insurance,
    has_vat,
  } = data;

  const result = {
    rental_price: 0,
    total_amount: 0,
    duration_days: 0,
    duration_hours: 0,
    base_price,
    weekend_price,
    overtime_price,
  }

  if (receive_datetime && return_datetime) {
    const
      estimateReceive = receive_datetime.split(' '),
      estimateReturn = return_datetime.split(' '),
      { price, countDays, countHours } = getPriceByDuration({
        receiveDate: estimateReceive[0],
        receiveTime: estimateReceive[1],
        returnDate: estimateReturn[0],
        returnTime: estimateReturn[1],
        basePrice: base_price,
        overtimePrice: overtime_price,
      });

    if (has_insurance) {
      result.insurance_cost = price * 0.1;
    }
    if (has_vat) {
      result.vat_cost = price * 0.1;
    }
    result.rental_price = price;
    result.duration_days = countDays;
    result.duration_hours = countHours;
    result.total_amount = price + (result.insurance_cost || 0) + (result.vat_cost || 0);
  }

  return result;
}

const durationType = {
  EARLY: 1,
  MORNING: 2,
  LAUNCH: 3,
  AFTERNOON: 4,
  EVENING: 5,
  NIGHT: 6,
}

const receiveRangeTimes = [
  ['00:00', '05:59', durationType.EARLY],
  ['06:00', '10:59', durationType.MORNING],
  ['11:00', '13:59', durationType.LAUNCH],
  ['14:00', '19:59', durationType.AFTERNOON],
  ['20:00', '21:59', durationType.EVENING],
  ['22:00', '23:59', durationType.NIGHT],
]

const returnRangeTimes = [
  ['00:00', '06:59', durationType.EARLY],
  ['06:00', '13:59', durationType.MORNING],
  ['14:00', '19:59', durationType.AFTERNOON],
  ['20:00', '21:59', durationType.EVENING],
  ['22:00', '23:59', durationType.NIGHT],
]

function getPriceByDuration(params) {
  const {
    receiveDate,
    receiveTime,
    returnDate,
    returnTime,
    basePrice,
    overtimePrice,
  } = params;

  const result = {
    countDays: 0,
    countHours: 0,
    price: 0,
  }


  // Tính đủ số ngày, vd 01/01 - 02/01 sẽ tính 2 ngày
  result.countDays = 1 + DateUtil.ceilBetweenDatetime(receiveDate, returnDate, 'YYYY-MM-DD');

  // Tính theo giờ giao
  const receiveRange = getRangeType(receiveRangeTimes, receiveTime);
  switch (receiveRange ? receiveRange[2] : null) {
    case durationType.EARLY:
      console.log('1');
      result.countHours += DateUtil.ceilBetweenDatetime(receiveTime, receiveRange[1], 'HH:mm', 'hour');
      break;

    case durationType.LAUNCH:
      console.log('2');
      result.countDays -= result.countDays > 1 ? 0.5 : 0;
      break;

    case durationType.AFTERNOON:
      console.log('3');
      result.countDays -= 0.5;
      break;

    case durationType.NIGHT:
      console.log('4');
      result.countDays -= 1;
      result.countHours += DateUtil.ceilBetweenDatetime(receiveTime, receiveRange[1], 'HH:mm', 'hour');
      result.countHours += 7; // 7h buổi sáng hôm sau
      break;

    default:
      break;
  }

  // Tính theo giờ trả
  const returnRange = getRangeType(returnRangeTimes, returnTime)
  switch (returnRange ? returnRange[2] : null) {
    case durationType.EARLY:
    case durationType.MORNING:
      console.log('A');
      result.countDays -= 0.5;
      break;

    case durationType.EVENING:
      console.log('B');
      result.countHours += DateUtil.ceilBetweenDatetime(returnRange[0], returnTime, 'HH:mm', 'hour');
      break;

    case durationType.NIGHT:
      console.log('C');
      result.countDays += 0.5;
      break;

    default:
      break;
  }

  result.price = (basePrice * result.countDays) + (overtimePrice * result.countHours);
  return result;
}

/**
 * 
 * @param {String} time Format HH:mm
 */
function getRangeType(rangeTimes, time) {
  return rangeTimes.find(r => DateUtil.compareGreaterTime(time, r[0], true) && DateUtil.compareLessTime(time, r[1]));
}

/**
 * Get rental price per day
 * @param {int} branchVehicleId branch_vehicle model id
 * @param {int} totalRentalDays total days
 * @returns percent or price fixed
 */
async function getPriceByRule(branchVehicleId, totalRentalDays) {
  let rule = await db.customer_day_price_rule.findOne({
    where: {
      branch_vehicle_id: branchVehicleId,
      day_count_from: {
        [Op.lte]: totalRentalDays
      },
      day_count_to: {
        [Op.gte]: totalRentalDays
      }
    }
  });
  if (!rule) {
    rule = await db.customer_day_price_rule.findOne({
      where: {
        branch_vehicle_id: branchVehicleId,
        day_count_from: {
          [Op.lt]: totalRentalDays
        },
        day_count_to: {
          [Op.lt]: totalRentalDays
        }
      },
      order: [['day_count_to', 'DESC']]
    });
  }
  return rule ? rule.price : 0;
}
