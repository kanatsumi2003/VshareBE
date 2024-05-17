/* eslint-disable indent */
const Constants = require("../constants");

exports.getBookingStatusLabel = (statusCode) => {
  switch (statusCode) {
    case Constants.BOOKING_STATUS_PENDING:
      return 'Đang xử lý';

    case Constants.BOOKING_STATUS_PREPAID:
      return 'Đã cọc';

    case Constants.BOOKING_STATUS_APPROVED:
      return 'Đã thẩm định';

    case Constants.BOOKING_STATUS_RECEIVED:
      return 'Giao xe';

    case Constants.BOOKING_STATUS_RUNNING:
      return 'Đang đi';

    case Constants.BOOKING_STATUS_RETURNED:
      return 'Trả xe';

    case Constants.BOOKING_STATUS_CANCELED:
      return 'Hủy';

    case Constants.BOOKING_STATUS_REFUND:
      return 'Hoàn cọc';

    default:
      break;
  }
};

exports.getApproveStatusLabel = (statusCode) => {
  switch (statusCode) {
    case Constants.APPROVE_STATUS_PENDING:
      return 'Đang chờ';
    case Constants.APPROVE_STATUS_FAILED:
      return 'Không đạt';
    case Constants.APPROVE_STATUS_PASSED:
      return 'Đạt';
  }
}
