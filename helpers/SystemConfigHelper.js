/* eslint-disable indent */
const constants = require("../constants");

exports.getVehicleClassName = (code) =>
  code == constants.VEHICLE_TYPE_CAR ? 'Ô tô' : code == constants.VEHICLE_TYPE_MOTOR ? 'Xe máy' : '';

exports.getFuelName = (code) =>
  code == constants.FUEL_GAS ? 'Xăng' : code == constants.FUEL_OIL ? 'Dầu' : code == constants.FUEL_ELECTRIC ? 'Điện' : '';

exports.getTransmissionName = (code) =>
  code == constants.TRANMISSION_TYPE_AUTO ? 'Tự động' : code == constants.TRANMISSION_TYPE_MANUAL ? 'Số sàn' : '';

exports.getBookingStatusName = (value) => {
  switch (value) {
    case constants.BOOKING_STATUS_PENDING:
      return 'Chờ xử lý';
    case constants.BOOKING_STATUS_PREPAID:
      return 'Đã cọc';
    case constants.BOOKING_STATUS_APPROVED:
      return 'Đã thẩm định';
    case constants.BOOKING_STATUS_RECEIVED:
      return 'Giao xe';
    case constants.BOOKING_STATUS_RUNNING:
      return 'Đang chạy';
    case constants.BOOKING_STATUS_RETURNED:
      return 'Trả xe';
    case constants.BOOKING_STATUS_CANCELED:
      return 'Hủy';
    case constants.BOOKING_STATUS_REFUND:
      return 'Hoàn cọc';

    default:
      return '';
  }
}

exports.getVehicleNameCode = (vehicleType) => {
  switch (vehicleType) {
    case constants.VEHICLE_TYPE_CAR:
      return 'OT';

    case constants.VEHICLE_TYPE_MOTOR:
      return 'XM';

    case constants.VEHICLE_TYPE_ELECTRIC:
      return 'XD';

    default:
      return '';
  }
}

exports.getDeliveryTaskTypeLabel = (taskType) => {
  if (taskType === constants.TASK_TYPE_RECEIVE) {
    return 'Giao xe'
  }
  if (taskType === constants.TASK_TYPE_RETURN) {
    return 'Nhận xe'
  }
  return '';
}
