import express from 'express';
const router = express.Router();

// Importing controllers
const {
  seeAllPharmacies,
  seePharmacy,
} = require('../controllers/pharmacyController');

// CREATE ROUTES

// READ ROUTES
router.get('/', seeAllPharmacies);
router.get('/:id', seePharmacy);

// UPDATE ROUTES

// DELETE ROUTES

module.exports = router;
