import express from 'express';
const router = express.Router();

// Importing controllers
const {
  loginCachier,
  refreshToken,
  logout,
  updateCredentiatls,
  deleteAccount,
  sellProducts,
} = require('../controllers/cachierController');
const {
  seeOurProducts,
  seeAllOrders,
  seeAllSales,
} = require('../controllers/pharmacyAdminController');

// Addiional imports
const { authCachier: auth } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/login', loginCachier);
router.post('/token', refreshToken);
router.post('/logout', auth, logout);
router.post('/sell', auth, sellProducts);

// READ ROUTES
router.get('/seeOurProducts', auth, seeOurProducts);
router.get('/seeAllOrders', auth, seeAllOrders);
router.get('/seeAllSales', auth, seeAllSales);

// UPDATE ROUTES
router.put('/', auth, updateCredentiatls);

// DELETE ROUTES
router.delete('/', auth, deleteAccount);

module.exports = router;
