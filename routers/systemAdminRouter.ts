import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

// Importing controllers
const { createSystemAdmin } = require('../controllers/systemAdminController');

// Additional imports

// CREATE ROUTES
router.post('/', createSystemAdmin);

// READ ROUTES

// UPDATE ROUTES

// DELETE ROUTES

module.exports = router;
