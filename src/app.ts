// Imports.
import express from 'express';
const cors = require('cors');
const app = express();

// Express configurations.
app.use(
  cors({
    origin: ['http://localhost:3000'],
    method: ['POST', 'GET', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// All the routers import
const systemAdminRouter = require('../routers/systemAdminRouter');
const pharmacyAdminRouter = require('../routers/pharmacyAdminRouter');
const cachierRouter = require('../routers/cachierRouter');
const customerRouter = require('../routers/customerRouter');
const pharmacyRouter = require('../routers/pharmacyRouter');

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
app.use('/api/cachier', cachierRouter);
app.use('/api/customer', customerRouter);
app.use('/api/pharmacy', pharmacyRouter);

// Exporting the app module
module.exports = app;
