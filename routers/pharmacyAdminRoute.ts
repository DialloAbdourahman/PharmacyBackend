import express from 'express';
const router = express.Router();

// Importing controllers
const {
  loginPharmacyAdmin,
  refreshToken,
} = require('../controllers/pharmacyAdminController');

// Addiional imports

// CREATE ROUTES
router.post('/login', loginPharmacyAdmin);
router.post('/token', refreshToken);
// router.post('/logout', auth, logout);

// READ ROUTES

// UPDATE ROUTES

// DELETE ROUTES

module.exports = router;
