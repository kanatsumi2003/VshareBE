const express = require('express'),
  Router = express.Router(),
  VehicleBrandRouter = require('./VehicleBrandRouter'),
  VehicleModelRouter = require('./VehicleModelRouter'),
  ProvinceRouter = require('./ProvinceRouter'),
  DistrictRouter = require('./DistrictRouter'),
  UserRouter = require('./UserRouter'),
  BranchVehicleRouter = require('./BranchVehicleRouter'),
  TrustScoreConfigRouter = require('./TrustScoreConfigRouter'),
  CustomerRouter = require('./CustomerRouter'),
  AttributeRouter = require('./AttributeRouter'),
  VehicleRouter = require('./VehicleRouter'),
  SystemConfigRouter = require('./SystemConfigRouter'),
  ClientRouter = require('./ClientRouter'),
  BookingRouter = require('./BookingRouter'),
  UploadRouter = require('./UploadRouter'),
  VehiclePriceRouter = require('./VehiclePriceRouter'),
  BookedScheduleRouter = require('./BookedScheduleRouter'),
  DeliveryTaskRouter = require('./DeliveryTaskRouter'),
  DocumentRouter = require('./DocumentRouter'),
  BranchRouter = require('./BranchRouter'),
  CustomerAppRouter = require('./CustomerAppRouter'),
  AuthRouter = require('./AuthRouter'),
  OwnerContractRouter = require('./OwnerContractRouter'),
  ExportRouter = require('./ExportRouter');

Router.use('/vehicle-brands', VehicleBrandRouter);
Router.use('/vehicle-models', VehicleModelRouter);
Router.use('/provinces', ProvinceRouter);
Router.use('/districts', DistrictRouter);
Router.use('/users', UserRouter);
Router.use('/customers', CustomerRouter);
Router.use('/branch-vehicles', BranchVehicleRouter);
Router.use('/branchs', BranchRouter);
Router.use('/trust-scores', TrustScoreConfigRouter);
Router.use('/attributes', AttributeRouter);
Router.use('/vehicles', VehicleRouter);
Router.use('/system-configs', SystemConfigRouter);
Router.use('/bookings', BookingRouter);
Router.use('/booked-schedules', BookedScheduleRouter);
Router.use('/delivery-tasks', DeliveryTaskRouter);
Router.use('/vehicle-prices', VehiclePriceRouter);
Router.use('/uploads', UploadRouter);
Router.use('/documents', DocumentRouter);
Router.use('/exports', ExportRouter);
Router.use('/auth', AuthRouter);
Router.use('/owner-contracts', OwnerContractRouter);
Router.use(ClientRouter);

Router.use('/customer-app/', CustomerAppRouter);

module.exports = Router;
