"use strict";

const { error: resError } = require("../utils/ResponseUtil");
const ExportService = require("../services/ExportService");

exports.exportBookingList = async (req, res) => {
  try {
    const buffer = await ExportService.exportBookingList(req.query);
    if (buffer) {
      const filename = `Danh_sach_don_hang.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader("Content-Disposition", "attachment; filename=" + filename);
      res.attachment(filename);
      return res.send(buffer);
    }
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
};

exports.exportCustomerList = async (req, res) => {
  try {
    const buffer = await ExportService.exportCustomerList(req.query);
    if (buffer) {
      const filename = `Danh_sach_khach_hang.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader("Content-Disposition", "attachment; filename=" + filename);
      res.attachment(filename);
      return res.send(buffer);
    }
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
};
