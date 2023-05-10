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

// Exporting the app module
module.exports = app;
