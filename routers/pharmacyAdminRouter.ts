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
  updateProduct,
  deleteProduct,
  seeOurProducts,
  seeOneOFOurProduct,
  seeAllOrders,
  seeAllSales,
} = require('../controllers/pharmacyAdminController');
const { seeProducts } = require('../controllers/systemAdminController');

// Addiional imports
const { authPharmacyAdmin: auth } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/login', loginPharmacyAdmin); // Tested.
router.post('/token', refreshToken); // Tested.
router.post('/logout', auth, logout); // Tested.
router.post('/createPharmacyAdmin', auth, createPharmacyAdmin); // Tested.
router.post('/createCachier', auth, createCachier); // Tested.
router.post('/createProduct', auth, createProduct); // Tested.

// READ ROUTES
router.get('/seeAllCachiers', auth, seeAllCachiers); // Tested.
router.get('/seeCachier/:id', auth, seeCachier); // Tested.
router.get('/seeOurProducts', auth, seeOurProducts); // Tested.
router.get('/seeOneOFOurProduct/:id', auth, seeOneOFOurProduct); // Tested.
router.get('/seeAllOrders', auth, seeAllOrders); // Tested.
router.get('/seeAllSales', auth, seeAllSales); // Tested.
router.get('/seeDrugList', auth, seeProducts); // Tested.
router.get('/', auth, seeAllPharmacyAdmins); // Tested.

// UPDATE ROUTES
router.put('/updateProduct/:id', auth, updateProduct); // Tested.
router.put('/', auth, updateInformation); // Tested.

// DELETE ROUTES
router.delete('/deleteCachier/:id', auth, deleteCachier); // Tested.
router.delete('/deleteProduct/:id', auth, deleteProduct); // Tested.

module.exports = router;
