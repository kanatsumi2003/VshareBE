'use strict'

const Router = require('express').Router();
const { validate } = require('express-validation');
const BranchVehicleController = require('@controller/BranchVehicleController');
const BookingController = require('@controller/BookingController');
const BranchController = require('@controller/BranchController');
const AuthController = require("@controller/AuthController");
const CustomerController = require("@controller/CustomerController");
const CustomerAppValidator = require("@validation/CustomerAppValidator");
const VehicleBrandController = require("@controller/VehicleBrandController");
const UploadController = require("@controller/UploadController");
const authenticate = require('../../middleware/authenticate');

Router.get('/branch-vehicles', validate(CustomerAppValidator.getAvaiableVehicles), BranchVehicleController.getAvaiableVehicles);
Router.get('/brands', VehicleBrandController.getItems);
Router.post('/bookings', validate(CustomerAppValidator.createBooking), BookingController.createItem);
Router.delete('/bookings/:id', BookingController.cancelItem);
Router.get('/mybookings', authenticate(), BookingController.getMyBookings);
Router.put('/bookings/:bookingId', BookingController.updateItem);
Router.get('/branches', BranchController.getItems);
Router.get('/branches/:branchId', BranchController.getItem);
Router.post('/login', AuthController.customerLogin);
Router.post('/register', validate(CustomerAppValidator.register), AuthController.customerRegister);
Router.post('/forgot-password', validate(CustomerAppValidator.forgotPassword), AuthController.customerForgotPassword);
Router.post('/change-password', authenticate(), validate(CustomerAppValidator.changePassword), AuthController.customerChangePassword);
Router.get('/profile', authenticate(), CustomerController.customerGetProfile);
Router.post('/profile', authenticate(), validate(CustomerAppValidator.updateProfile), CustomerController.customerUpdateProfile);
Router.get('/payment-methods', BranchController.getPaymentMethods);
Router.post('/calc-price', BookingController.calculatePrice);
Router.post('/upload', UploadController.uploadFile);

module.exports = Router;
