import express from 'express';
const router = express.Router();

// Importing controllers
const {
  seeAllPharmacies,
  seePharmacy,
} = require('../controllers/pharmacyController');

// CREATE ROUTES

// READ ROUTES
router.get('/', seeAllPharmacies); // Tested.
router.get('/:id', seePharmacy); // Tested.

// UPDATE ROUTES

// DELETE ROUTES

module.exports = router;
