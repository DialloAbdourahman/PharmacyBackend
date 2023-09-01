import express from 'express';
const router = express.Router();

// Importing controllers
const {
  loginCachier,
  refreshToken,
  logout,
  updateCredentiatls,
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
router.post('/login', loginCachier); // Tested.
router.post('/token', refreshToken); // Tested.
router.post('/logout', auth, logout); // Tested.
router.post('/sell', auth, sellProducts); // Tested.

// READ ROUTES
router.get('/seeOurProducts', auth, seeOurProducts); // Tested.
router.get('/seeAllOrders', auth, seeAllOrders); // Tested.
router.get('/seeAllSales', auth, seeAllSales); // Tested.

// UPDATE ROUTES
router.put('/', auth, updateCredentiatls); // Tested.

// DELETE ROUTES

module.exports = router;
