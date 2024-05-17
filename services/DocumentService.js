const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
// const ImageModule = require("docxtemplater-image-module");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const momentTz = require('moment-timezone');
const { formatVND, formatNumber, formatDuration, formatDurationToDays } = require('../utils/FormatUtil');
const constants = require("../constants");

exports.genBookingContract = function (bookingData) {
  const content = fs.readFileSync(
    path.resolve(__dirname, "../static/templates/HD_Thue_Xe_Tu_Lai_v1.docx"),
    "binary"
  );
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  const {
    code,
    customer: { fullname, address, phone, birthday, identity_number, identity_date, driver_licence_number, driver_licence_date } = {},
    estimate_receive_datetime,
    estimate_return_datetime,
    estimate_rental_duration,
    branch: { full_address, bank_account_number, bank_branch_name, bank_name } = {},
    prepay = 0,
    estimate_price,
    actual_price,
    estimate_branch_vehicle,
    vehicle: { name: vehicle_name } = {},
    contract_sign_date,
    add_ons,
    delivery_fee,
    user_created = {},
  } = bookingData;
  const branchData = bookingData.branch || {},
    { fullname: agentName, phone: agentPhone } = user_created,
    { customer_day_km_limit, customer_overkm_price, customer_overtime_price } = estimate_branch_vehicle || {},
    dayLimitKm = customer_day_km_limit || branchData.limit_km

  let tax_number = branchData.tax_number,
    insuranceAddon = (add_ons || []).find(ao => ao.code == constants.ADDON_INSURANCE),
    insurance_fee = insuranceAddon ? insuranceAddon.cost : 0;
  doc.render({
    booking_code: code || '…………….………….',
    contract_sign_date: contract_sign_date ? moment(contract_sign_date).format('DD/MM/YYYY') : '……………………',
    branch_address: full_address || '………………………………………………………………',
    agent_name: agentName || '…………………………………………',
    agent_phone: agentPhone || '……………………',
    tax_number: tax_number || '……………………',
    bank_name: bank_name || '……………………',
    bank_branch_name: bank_branch_name || '……………………',
    bank_account_number: bank_account_number || '……………………',
    customer_fullname: fullname || '…………………………………………',
    customer_phone: phone || '……………………',
    customer_address: address || '………………………………………………………………',
    customer_birthday: birthday ? moment(birthday).format('DD/MM/YYYY') : '……………………',
    customer_identity_number: identity_number || '……………………',
    customer_identity_date: identity_date ? moment(identity_date).format('DD/MM/YYYY') : '……………………',
    customer_driver_licence: driver_licence_number || '……………………',
    customer_licence_date: driver_licence_date ? moment(driver_licence_date).format('DD/MM/YYYY') : '……………………',
    vehicle_name: vehicle_name || '……………………',
    receive_date: estimate_receive_datetime ? momentTz.tz(estimate_receive_datetime, 'Asia/Ho_Chi_Minh').format('HH:mm, [ngày] DD/MM/YYYY') : '…………………….',
    return_date: estimate_return_datetime ? momentTz.tz(estimate_return_datetime, 'Asia/Ho_Chi_Minh').format('HH:mm, [ngày] DD/MM/YYYY') : '…………………….',
    rental_duration: estimate_rental_duration ? formatDuration(estimate_rental_duration) : '…………………….',
    insurance_fee: insurance_fee ? formatVND(insurance_fee) : '…………………….đ',
    delivery_fee: delivery_fee ? formatVND(delivery_fee) : '…………………….đ',
    estimate_price: estimate_price ? formatVND(estimate_price) : '…………………….đ',
    deposit_cash: prepay ? formatVND(prepay) : '…………………….đ',
    total_amount: actual_price ? formatVND(actual_price) : '…………………….đ',
    remain_amount: actual_price ? formatVND(actual_price - prepay) : '…………………….đ',
    km_limit: dayLimitKm ? formatNumber(dayLimitKm, 'km') : '…………………….km',
    overkm_price: customer_overkm_price ? formatVND(customer_overkm_price) : '…………………….đ',
    overtime_price: customer_overtime_price ? formatVND(customer_overtime_price, 'đ/km') : '…………………….đ/km',
  });

  const buf = doc.getZip().generate({
    type: "nodebuffer",
    // compression: DEFLATE adds a compression step.
    // For a 50MB output document, expect 500ms additional CPU time
    compression: "DEFLATE",
  });
  return buf;
  // fs.writeFileSync(path.resolve(__dirname, "../static/booking/output.docx"), buf);
}

exports.genReceiveReport = function (bookingData) {
  const content = fs.readFileSync(
    path.resolve(__dirname, "../static/templates/BB_Giao_Xe_v1.docx"),
    "binary"
  );
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  const {
    code,
    fullname, address, phone, identity_number,
    receive_km, receive_fuel = '', actual_return_datetime, receive_etc_balance, vehicle_full,
    deposit: { identity_paper = '', identity_paper_note, motor = '', motor_registration = '', cash = 0, other = '' } = {},
    estimate_branch_vehicle,
    actual_branch_vehicle,
    vehicle: { name: vehicle_name, fuel, seats },
    receive_vehicle_status,
    actual_receive_datetime,
    give_user = {},
  } = bookingData;
  const { fullname: agentName, phone: agentPhone } = give_user,
    vehicle_fuel = [
      fuel == 'G' ? "☑ Xăng A95" : "☐ Xăng A95",
      fuel == 'O' ? "☑ Dầu" : "☐ Dầu",
      fuel == 'E' ? "☑ Điện" : "☐ Điện",
    ].join('  '),
    fuelFull = receive_fuel == '100',
    branchVehicle = actual_branch_vehicle || estimate_branch_vehicle || {},
    license_number = branchVehicle.license_number || '',
    vehicle_color = branchVehicle.vehicle_color || '',
    identityName = identity_paper == 'identity' ? 'CCCD' : identity_paper == 'house_hold' ? 'Sổ tạm trú/Hộ khẩu' : identity_paper == 'passport' ? 'Hộ chiếu' : ''

  doc.render({
    booking_code: code || '…………….………….',
    current_date: actual_receive_datetime ? moment(actual_receive_datetime).format('DD/MM/YYYY') : '……………………',
    agent_name: agentName || '……………………',
    agent_phone: agentPhone || '……………………',
    customer_fullname: fullname || '……………………',
    customer_phone: phone || '……………………',
    customer_other_phone: '……………………',
    customer_address: address || '…………………………………………',
    customer_identity_number: identity_number || '……………………',
    vehicle_name: vehicle_name || '……………………',
    vehicle_fuel,
    vehicle_seats: seats || '……………………',
    vehicle_license: license_number,
    vehicle_color,
    vehicle_status_full: vehicle_full ? '☑' : '☐',
    vehicle_status_miss: receive_vehicle_status ? '☑' : '☐',
    vehicle_status_note: receive_vehicle_status || '…………………………………………',
    receive_km: formatNumber(receive_km, 'km'),
    receive_fuel: fuelFull ? '' : `${receive_fuel}%`,
    fuel_full: fuelFull ? '☑' : '☐',
    fuel_exhausted: fuelFull ? '☐' : '☑',
    receive_etc_balance: receive_etc_balance ? formatVND(receive_etc_balance) : '',
    return_date: actual_return_datetime ? momentTz.tz(actual_return_datetime, 'Asia/Ho_Chi_Minh').format('HH:mm, [ngày] DD/MM/YYYY') : '',
    deposit_identity: identity_paper ? '☑' : '☐',
    deposit_identity_name: identityName || 'Sổ tạm trú/Hộ khẩu/Hộ chiếu/CCCD',
    deposit_identity_note: identity_paper_note || '……………………',
    deposit_motor: motor ? '☑' : '☐',
    deposit_motor_note: motor,
    deposit_motor_registration: motor_registration ? '☑' : '☐',
    deposit_motor_registration_note: motor_registration,
    deposit_cash: cash ? '☑' : '☐',
    deposit_cash_note: cash ? formatVND(cash) : '',
    deposit_other: other ? '☑' : '☐',
    deposit_other_note: other || '',
  });

  const buf = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  return buf;
}

exports.genReturnReport = function (bookingData) {
  const content = fs.readFileSync(
    path.resolve(__dirname, "../static/templates/BB_Nhan_Xe_v1.docx"),
    "binary"
  );
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  const {
    code,
    fullname, address, phone, identity_number,
    receive_km, receive_fuel = '', return_km, return_fuel, actual_return_datetime, receive_etc_balance, vehicle_full,
    deposit: { identity_paper = '', identity_paper_note, motor = '', motor_registration = '', cash = 0, other = '' } = {},
    estimate_branch_vehicle,
    actual_branch_vehicle,
    vehicle: { name: vehicle_name, fuel, seats },
    hold_customer_note,
    receive_vehicle_status,
    return_vehicle_status,
    estimate_rental_duration,
    actual_rental_duration,
    branch = {},
    return_user = {},
  } = bookingData;
  const { limit_km } = branch || {},
    other_costs = bookingData.other_costs || [],
    { fullname: agentName, phone: agentPhone } = return_user || {},
    { customer_day_km_limit } = actual_branch_vehicle || estimate_branch_vehicle || {},
    vehicle_fuel = [
      fuel == 'G' ? "☑ Xăng A95" : "☐ Xăng A95",
      fuel == 'O' ? "☑ Dầu" : "☐ Dầu",
      fuel == 'E' ? "☑ Điện" : "☐ Điện",
    ].join('  '),
    durationRental = formatDurationToDays(actual_rental_duration || estimate_rental_duration),
    fuelFull = receive_fuel == '100',
    vehicleRepair = other_costs.find(c => c.code == constants.OTHER_COST_REPAIR),
    overtimeCost = other_costs.find(c => c.code == constants.OTHER_COST_OVERTIME),
    overkmCost = other_costs.find(c => c.code == constants.OTHER_COST_OVERKM),
    fuelCost = other_costs.find(c => c.code == constants.OTHER_COST_FUEL),
    tollsCost = other_costs.find(c => c.code == constants.OTHER_COST_TOLLS),
    forbiddenRoad = other_costs.find(c => c.code == constants.OTHER_COST_FORBIDDEN_ROAD),
    overSpeed = other_costs.find(c => c.code == constants.OTHER_COST_OVERSPEED),
    redLight = other_costs.find(c => c.code == constants.OTHER_COST_RED_LIGHT),
    otherViolation = other_costs.find(c => c.code == constants.OTHER_COST_VIOLATION_OTHER),
    hasViolation = forbiddenRoad || overSpeed || redLight || otherViolation,
    limitKmPerDay = customer_day_km_limit || limit_km || 0,
    distance = return_km - receive_km,
    maxKm = limitKmPerDay * durationRental,
    overkm = distance - maxKm,
    branchVehicle = actual_branch_vehicle || estimate_branch_vehicle || {},
    license_number = branchVehicle.license_number || '',
    vehicle_color = branchVehicle.vehicle_color || '',
    identityName = identity_paper == 'identity' ? 'CCCD' : identity_paper == 'house_hold' ? 'Sổ tạm trú/Hộ khẩu' : identity_paper == 'passport' ? 'Hộ chiếu' : ''

  doc.render({
    booking_code: code || '…………….………….',
    current_date: actual_return_datetime ? moment(actual_return_datetime).format('DD/MM/YYYY') : '……………………',
    agent_name: agentName || '……………………',
    agent_phone: agentPhone || '……………………',
    customer_fullname: fullname || '……………………',
    customer_phone: phone || '……………………',
    customer_other_phone: '……………………',
    customer_address: address || '…………………………………………',
    customer_identity_number: identity_number || '……………………',
    vehicle_name: vehicle_name || '……………………',
    vehicle_fuel,
    vehicle_seats: seats || '……………………',
    vehicle_license: license_number,
    vehicle_color,
    vehicle_status_full: vehicle_full ? '☑' : '☐',
    vehicle_status_miss: receive_vehicle_status ? '☑' : '☐',
    vehicle_status_note: receive_vehicle_status || '…………………………………………',
    receive_km: formatNumber(receive_km, 'km'),
    receive_fuel: fuelFull ? '' : `${receive_fuel}%`,
    fuel_full: fuelFull ? '☑' : '☐',
    fuel_exhausted: fuelFull ? '☐' : '☑',
    receive_etc_balance: receive_etc_balance ? formatVND(receive_etc_balance) : '',
    return_date: actual_return_datetime ? momentTz.tz(actual_return_datetime, 'Asia/Ho_Chi_Minh').format('HH:mm, [ngày] DD/MM/YYYY') : '',
    deposit_identity: identity_paper ? '☑' : '☐',
    deposit_identity_name: identityName || 'Sổ tạm trú/Hộ khẩu/Hộ chiếu/CCCD',
    deposit_identity_note: identity_paper_note || '……………………',
    deposit_motor: motor ? '☑' : '☐',
    deposit_motor_note: motor,
    deposit_motor_registration: motor_registration ? '☑' : '☐',
    deposit_motor_registration_note: motor_registration,
    deposit_cash: cash ? '☑' : '☐',
    deposit_cash_note: cash ? formatVND(cash) : '',
    deposit_other: other ? '☑' : '☐',
    deposit_other_note: other || '',
    return_status_full: return_vehicle_status ? '☐' : '☑',
    return_status_broken: !return_vehicle_status ? '☐' : '☑',
    return_status_note: return_vehicle_status || '…………………………………………………………………………………………',
    other_repair_cost: vehicleRepair ? formatVND(vehicleRepair.cost) : '…………..…………đ',
    return_km: Number.isInteger(return_km) ? formatNumber(return_km, 'km') : '',
    distance: Number.isInteger(distance) ? formatNumber(distance, 'km') : '',
    allow_limit_km: maxKm && overkm > 0 ? '☐' : '☑',
    disallow_limit_km: maxKm && overkm > 0 ? '☑' : '☐',
    overkm: maxKm && overkm > 0 ? formatNumber(overkm) : '……………………',
    other_overkm_cost: overkmCost ? formatVND(overkmCost.cost) : '……………………',
    return_fuel_full: receive_fuel && return_fuel && Number(return_fuel) >= Number(receive_fuel) ? '☑' : '☐',
    return_fuel_miss: receive_fuel && return_fuel && Number(return_fuel) < Number(receive_fuel) ? '☑' : '☐',
    return_fuel_note: receive_fuel && return_fuel && Number(return_fuel) < Number(receive_fuel) ? `${Math.abs(return_fuel - receive_fuel)}%` : '….…',
    other_fuel_cost: fuelCost ? formatVND(fuelCost.cost) : '… …………..……..đ',
    overtime: overtimeCost ? overtimeCost.note : '',
    other_overtime_cost: overtimeCost ? formatVND(overtimeCost.cost) : '……………………',
    other_tolls_cost: formatVND(tollsCost ? tollsCost.cost : 0),
    has_violation: hasViolation ? '☑' : '☐',
    no_violation: !hasViolation ? '☑' : '☐',
    other_overspeed_cost: overSpeed ? overSpeed.note : '……/……..',
    other_forbidden_road_cost: forbiddenRoad ? forbiddenRoad.note : '……………………………',
    other_red_light_cost: redLight ? redLight.note : '………………………………...',
    other_violation_cost: otherViolation ? other.note : '………………………',
    total_other_cost: formatVND(other_costs.reduce((a, b) => a + b.cost || 0, 0)),
    no_hold_customer: hold_customer_note ? '☐' : '☑',
    has_hold_customer: hold_customer_note ? '☑' : '☐',
    hold_customer_note: hold_customer_note || `………………………………………………………………………………………\nThời gian dự kiến trả: …………………………………………………………..\nLý do: ………………………………………………………………………………`,
  });

  const buf = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  return buf;
}

exports.genContractAppraisal = function (bookingData) {
  const content = fs.readFileSync(
    path.resolve(__dirname, "../static/templates/Tham_Dinh_HD_v1.docx"),
    "binary"
  );

  const imageOpts = {
    centered: false,
    getImage: function (tagValue, tagName) {
      return fs.readFileSync(tagValue);
    },
    getSize: function (img, tagValue, tagName) {
      return [150, 150];
    },
  };
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  const {
    receive_km, receive_fuel = '',
    deposit: { identity = '', motor = '', motor_registration = '', cash = 0, other = '' } = {},
    customer: { fullname, address, phone, identity_number },
    branch_vehicle: { license_number = '', vehicle_color = '', etc_balance },
    vehicle: { name: vehicle_name, fuel, seats }
  } = bookingData;

  doc.render({
    current_date: momentTz.tz('Asia/Ho_Chi_Minh').format('HH:mm, [ngày] DD/MM/YYYY'),
    customer_fullname: fullname || '',
    customer_phone: phone || '',
    customer_other_phone: '',
    customer_address: address || '',
    customer_identity_number: identity_number || '',
    customer_identity_date,
    customer_driver_licence,
    customer_licence_number,
    procedure_household,
    procedure_household_note,
    procedure_household_conclusion,
    procedure_identity_front,
    procedure_identity_back,
    procedure_identity_note,
    procedure_identity_conclusion,
    procedure_driver_licence_front,
    procedure_driver_licence_back,
    procedure_licence_note,
    procedure_licence_conclustion,
    procedure_other,
    rental_purpose,
    rental_schedule,
    estimate_receive_datetime,
    estimate_return_datetime,
    estimate_rental_duration,
    approve_conclusion,
    image: "examples/image.png"
  });

  const buf = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  return buf;
}
