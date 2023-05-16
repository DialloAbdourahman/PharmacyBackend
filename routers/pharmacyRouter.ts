import express from 'express';
const router = express.Router();

// Importing controllers
const { createPharmacy } = require('../controllers/pharmacyController');

// Addiional imports
const { authSystemAdmin } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/', authSystemAdmin, createPharmacy);

// READ ROUTES

// UPDATE ROUTES

// DELETE ROUTES

module.exports = router;
