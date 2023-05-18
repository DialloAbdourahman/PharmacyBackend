// Imports.
import express from 'express';
const cors = require('cors');
const app = express();

// Express configurations.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// All the routers import
const systemAdminRouter = require('../routers/systemAdminRouter');
const pharmacyAdminRouter = require('../routers/pharmacyAdminRouter');
const pharmacyRouter = require('../routers/pharmacyRouter');
const pharmacyManagerRouter = require('../routers/pharmacyManagerRouter');

// Adding user and token on the request object.
declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

// Routes to routers mapping.
app.use('/api/systemAdmin', systemAdminRouter);
app.use('/api/pharmacyAdmin', pharmacyAdminRouter);
app.use('/api/pharmacy', pharmacyRouter);
app.use('/api/pharmacyManager', pharmacyManagerRouter);

// Exporting the app module
module.exports = app;
