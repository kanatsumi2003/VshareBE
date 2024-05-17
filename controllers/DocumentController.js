'use strict';

const { error: resError } = require('../utils/ResponseUtil');
const BranchService = require("../services/BranchService");
const BranchVehicleService = require("../services/BranchVehicleService");
const DocumentService = require("../services/DocumentService");
const db = require('../models');
const UserService = require('../services/UserService');

exports.previewBookingContract = async (req, res) => {
  try {
    const data = req.body
    data.customer = {
      fullname: data.fullname || '',
      address: data.address || '',
      phone: data.phone || '',
      birthday: data.birthday || '',
      identity_number: data.identity_number || '',
      identity_date: data.identity_date || '',
      driver_licence_number: data.driver_licence_number || '',
      driver_licence_date: data.driver_licence_date || '',
    }
    if (data.branch_id) {
      data.branch = await BranchService.getById(data.branch_id) || {};
    }
    if (data.estimate_branch_vehicle_id) {
      const branchVehicle = await BranchVehicleService.getById(data.estimate_branch_vehicle_id);
      data.estimate_branch_vehicle = branchVehicle ? branchVehicle.toJSON() : {}
      data.vehicle = branchVehicle ? await branchVehicle.getVehicle({ attributes: ['name'], raw: true }) : {}
    }
    if (data.contract_created_by) {
      data.user_created = await UserService.getOne({ id: data.contract_created_by }, { attributes: ['fullname', 'phone'] })
    }
    const file = await DocumentService.genBookingContract(data);
    const fileName = 'Hop_Dong_Thue_Xe';
    if (file) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}.docx`);
      res.attachment(`${fileName}.docx`);
      return res.send(file);
    }
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
}

exports.previewReceiveReport = async (req, res) => {
  try {
    const data = req.body
    if (data.give_user_id) {
      data.give_user = await UserService.getOne({ id: data.give_user_id }, { attributes: ['fullname', 'phone'] })
    }
    if (data.actual_branch_vehicle_id) {
      data.actual_branch_vehicle = await BranchVehicleService.getOne({ id: data.actual_branch_vehicle_id }, {
        attributes: ['license_number', 'vehicle_color', 'customer_day_km_limit'],
        include: [
          { model: db.vehicle, attributes: ['name', 'fuel', 'seats'] }
        ]
      }) || {};
    }
    if (data.branch_id) {
      data.branch = await BranchService.getOne({ id: data.branch_id }, { attributes: ['limit_km'] })
    }
    data.vehicle = data.actual_branch_vehicle ? data.actual_branch_vehicle.vehicle : data.estimate_branch_vehicle ? data.estimate_branch_vehicle.vehicle : {}
    const file = await DocumentService.genReceiveReport(data);
    const fileName = 'Bien_Ban_Giao_Xe';
    if (file) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}.docx`);
      res.attachment(`${fileName}.docx`);
      return res.send(file);
    }
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
}

exports.previewReturnReport = async (req, res) => {
  try {
    const data = req.body
    if (data.return_user_id) {
      data.return_user = await UserService.getOne({ id: data.return_user_id }, { attributes: ['fullname', 'phone'] })
    }
    if (data.actual_branch_vehicle_id) {
      data.actual_branch_vehicle = await BranchVehicleService.getOne({ id: data.actual_branch_vehicle_id }, {
        attributes: ['license_number', 'vehicle_color', 'customer_day_km_limit'],
        include: [
          { model: db.vehicle, attributes: ['name', 'fuel', 'seats'] }
        ]
      }) || {};
    }
    if (data.branch_id) {
      data.branch = await BranchService.getOne({ id: data.branch_id }, { attributes: ['limit_km'] })
    }
    data.vehicle = data.actual_branch_vehicle ? data.actual_branch_vehicle.vehicle : data.estimate_branch_vehicle ? data.estimate_branch_vehicle.vehicle : {}
    const file = await DocumentService.genReturnReport(data);
    const fileName = 'Bien_Ban_Nhan_Xe';
    if (file) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}.docx`);
      res.attachment(`${fileName}.docx`);
      return res.send(file);
    }
  } catch (err) {
    console.error(err);
    return resError(res, { message: err.message });
  }
}
