'use strict';

const { validate } = require('express-validation');

function beautifyJson(body) {
  let result = {}
  Object.keys(body).forEach(key => result[key] = typeof body[key] === 'string' ? body[key].trim() : (key.endsWith('_id') && body[key] === 0) ? null : body[key]);
  return result;
}

function requestValidate(schema) {
  return validate(schema, {}, { abortEarly: false });
}

function formatValidationMessage(error) {
  var errors = {
    "\"actual_branch_vehicle_id\"": "Xe thực tế",
    "\"actual_price\"": "Giá thực tế",
    "\"actual_receive_datetime\"": "Ngày giao xe thực tế",
    "\"actual_return_datetime\"": "Ngày trả xe thực tế",
    "\"address\"": "Địa chỉ",
    "\"approve_by\"": "Người thẩm định",
    "\"birthday\"": "Ngày sinh",
    "\"branch_id\"": "Chi nhánh",
    "\"estimate_branch_vehicle_id\"": "Xe dự kiến",
    "\"estimate_price\"": "Giá dự kiến",
    "\"estimate_receive_datetime\"": "Ngày giao xe dự kiến",
    "\"estimate_return_datetime\"": "Ngày trả xe dự kiến",
    "\"fullname\"": "Họ tên",
    "\"give_user_id\"": "Người giao xe",
    "\"identity_number\"": "CMND/CCCD",
    "\"name\"": "Tên",
    "\"payment_method\"": "Phương thức thanh toán",
    "\"phone\"": "Số điện thoại",
    "\"receive_fuel\"": "Nhiên liệu lúc nhận",
    "\"receive_km\"": "Km lúc nhận",
    "\"receive_type\"": "Hình thức nhận xe",
    "\"return_fuel\"": "Nhiên liệu lúc trả",
    "\"return_km\"": "Km lúc trả",
    "\"return_user_id\"": "Người nhận xe",
    "\"saler_id\"": "Người thẩm định",
    "\"source\"": "Nguồn",
    "\"vehicle_type\"": "Loại xe",
    "\"vehicle_class\"": "Hạng xe",
    // Joi message
    "with value": "",
    "fails to match the required pattern:": "không đúng định dạng",
    "must be a number": "phải là dạng số",
    "must be one of": "chỉ cho phép",
    "is not allowed to be empty": "không được bỏ trống",
    "is not allowed": "không hợp lệ",
    "must be a valid date": "không đúng định dạng thời gian",
    "must be a string": "phải là dạng chữ",
    "must be a valid email": "không đúng định dạng email",
  };
  const re = new RegExp(Object.keys(errors).join("|"), "gi");
  const { body, query } = error.details;
  let message = '';
  if (body) {
    message += body.map(row => row.message).join('\n');
  }
  if (query) {
    message += query.map(row => row.message).join('\n');
  }
  message = message.replace(re, function (matched) {
    return errors[matched];
  });
  return message;
}

module.exports = {
  beautifyJson,
  requestValidate,
  formatValidationMessage,
}
