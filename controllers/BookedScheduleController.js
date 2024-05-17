'use strict';

const Op = require('sequelize').Op;
const moment = require('moment');
const momentTz = require('moment-timezone');
const { success: resSuccess } = require('../utils/ResponseUtil');
const RegexUtil = require('../utils/RegexUtil');
const BookedScheduleService = require('../services/BookedScheduleService');
const BranchVehicleService = require('../services/BranchVehicleService');
const Constants = require('../constants');

exports.getItems = async (req, res) => {
  const { from_date, to_date, date_type, branch_id, license_number, vehicle_class, show_avaiable, price_range } = req.query,
    scheduleParams = {},
    branchVehicleParams = {},
    result = {
      minDate: from_date || moment().add(-7, 'days').format('YYYY-MM-DD'),
      maxDate: to_date || moment().add(7, 'days').format('YYYY-MM-DD'),
      data: []
    },
    minDatetime = momentTz.tz(result.minDate, 'Asia/Ho_Chi_Minh').startOf('day').format(),
    maxDatetime = momentTz.tz(result.maxDate, 'Asia/Ho_Chi_Minh').endOf('day').format();

  result.totalDays = Math.ceil(moment(maxDatetime).diff(minDatetime, 'day', true));
  result.listDays = Array.from({ length: result.totalDays }, (v, i) => i).map(i => moment(result.minDate).add(i, 'day').format('YYYY-MM-DD'));
  result.weekends = result.listDays.map(d => [0, 6].includes(moment(d).day()) ? d : null).filter(i => i)

  if (branch_id) {
    scheduleParams.branch_id = branch_id;
    branchVehicleParams.branch_id = branch_id;
  }
  if (!date_type)
    scheduleParams.date_type = Constants.SCHEDULE_DATE_TYPE_RECEIVE;
  if (license_number)
    // Do KH đổi y/c search theo tên thay vì bks
    branchVehicleParams.name = {
      [Op.like]: `%${license_number}%`,
    }
  if (vehicle_class)
    branchVehicleParams.vehicle_class = vehicle_class;
  if (price_range) {
    const [price_from, price_to] = price_range.split('-');
    if (RegexUtil.numberRegex.test(price_from))
      branchVehicleParams.price_from = Number(price_from);
    if (RegexUtil.numberRegex.test(price_to))
      branchVehicleParams.price_to = Number(price_to);
  }

  try {
    result.branchVehicles = await BranchVehicleService.getListVehicles(branchVehicleParams);
    result.data = await BookedScheduleService.getSchedule({
      ...scheduleParams,
      start: minDatetime,
      end: maxDatetime,
    })
    // if (result.data.length) {
    //   for (const branchVehicle of result.data) {
    //     const index = result.branchVehicles.findIndex(v => v.id == branchVehicle.branch_vehicle_id);
    //     if (index > -1) {
    //       const tmp = { ...result.branchVehicles[index] };
    //       result.branchVehicles.splice(index, 1);
    //       if (show_avaiable != 1 || (show_avaiable == 1 && [Constants.DELIVERY_STATUS_CANCELED, Constants.DELIVERY_STATUS_RETURNED].includes(branchVehicle.delivery_status))) {
    //         result.branchVehicles.unshift(tmp);
    //       }
    //     }
    //   }
    // }
    if (show_avaiable == 1) {
      result.branchVehicles = result.branchVehicles
        .filter(bv => !result.data.some(r => r.branch_vehicle_id === bv.id));
    }
    return resSuccess(res, { data: result });
  } catch (error) {
    console.error(error);
    return resSuccess(res, { data: result });
  }
}