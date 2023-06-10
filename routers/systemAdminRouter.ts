import express from 'express';
const router = express.Router();

// Importing controllers
const {
  createSystemAdmin,
  loginSystemAdmin,
  refreshToken,
  logout,
  updateSystemAdmin,
  allSystemAdmins,
  createPharmacy,
  deletePharmacy,
  updatePharmacy,
  createProduct,
  seeProducts,
  seeProduct,
  updateProduct,
  allPharmacies,
  deleteProduct,
} = require('../controllers/systemAdminController');

// Additional imports
const { authSystemAdmin: auth } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/login', loginSystemAdmin);
router.post('/token', refreshToken);
router.post('/logout', auth, logout);
router.post('/createPharmacy', auth, createPharmacy);
router.post('/createProduct', auth, createProduct);
router.post('/', auth, createSystemAdmin);

// READ ROUTES
router.get('/seeProducts', auth, seeProducts);
router.get('/seeProduct/:id', auth, seeProduct);
router.get('/allPharmacies', auth, allPharmacies);
router.get('/', auth, allSystemAdmins);

// UPDATE ROUTES
router.put('/updatePharmacy/:id', auth, updatePharmacy);
router.put('/updateProduct/:id', auth, updateProduct);
router.put('/', auth, updateSystemAdmin);

// DELETE ROUTES
router.delete('/deletePharmacy/:id', auth, deletePharmacy);
router.delete('/deleteProduct/:id', auth, deleteProduct);

module.exports = router;
