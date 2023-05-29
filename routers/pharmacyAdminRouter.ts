import express from 'express';
const router = express.Router();

// Importing controllers
const {
  loginPharmacyAdmin,
  refreshToken,
  logout,
  updateInformation,
  createPharmacyAdmin,
  createCachier,
  deleteCachier,
  seeAllPharmacyAdmins,
} = require('../controllers/pharmacyAdminController');

// Addiional imports
const { authPharmacyAdmin: auth } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/login', loginPharmacyAdmin);
router.post('/token', refreshToken);
router.post('/logout', auth, logout);
router.post('/createPharmacyAdmin', auth, createPharmacyAdmin);
router.post('/createCachier', auth, createCachier);

// READ ROUTES
router.get('/', auth, seeAllPharmacyAdmins);

// UPDATE ROUTES
router.put('/', auth, updateInformation);

// DELETE ROUTES
router.delete('/deleteCachier/:id', auth, deleteCachier);

module.exports = router;
