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
  seeAllCachiers,
  seeCachier,
  createProduct,
} = require('../controllers/pharmacyAdminController');

// Addiional imports
const { authPharmacyAdmin: auth } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/login', loginPharmacyAdmin);
router.post('/token', refreshToken);
router.post('/logout', auth, logout);
router.post('/createPharmacyAdmin', auth, createPharmacyAdmin);
router.post('/createCachier', auth, createCachier);
router.post('/createProduct', auth, createProduct);

// READ ROUTES
router.get('/seeAllCachiers', auth, seeAllCachiers);
router.get('/seeCachier/:id', auth, seeCachier);
router.get('/', auth, seeAllPharmacyAdmins);

// UPDATE ROUTES
router.put('/', auth, updateInformation);

// DELETE ROUTES
router.delete('/deleteCachier/:id', auth, deleteCachier);

module.exports = router;
