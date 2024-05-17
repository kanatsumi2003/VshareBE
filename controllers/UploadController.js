'use strict'

const { success: resSuccess, error: resError } = require('../utils/ResponseUtil');
const UploadService = require('../services/UploadService');

exports.uploadFile = async function (req, res) {
  try {
    const { file } = req.files || {};
    if (!file) {
      throw new Error('Không có tệp tin nào được tải lên.');
    }
    const link = await UploadService.uploadBinary(file);
    if (!link) {
      throw new Error('Server đang bận. Vui lòng thử lại sau.');
    }
    return resSuccess(res, { data: link });
  } catch (err) {
    return resError(res, { message: err.message })
  }
}