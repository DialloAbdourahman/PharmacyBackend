import express from 'express';
const router = express.Router();

// Importing controllers
const {
  loginPharmacyAdmin,
  refreshToken,
  logout,
  updateInformation,
  createPharmacyAdmin,
  deletePharmacyAdmin,
  createCachier,
  deleteCachier,
  updatePharmacy,
  deletePharmacy,
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

// UPDATE ROUTES
router.put('/updatePharmacy', auth, updatePharmacy);
router.put('/', auth, updateInformation);

// DELETE ROUTES
router.delete('/deletePharmacyAdmin/:id', auth, deletePharmacyAdmin);
router.delete('/deleteCachier/:id', auth, deleteCachier);
router.delete('/deletePharmacy', auth, deletePharmacy);

module.exports = router;
