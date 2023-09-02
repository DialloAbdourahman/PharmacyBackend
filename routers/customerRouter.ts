import express from 'express';
const router = express.Router();

// Importing controllers
const {
  createCustomer,
  loginCustomer,
  logoutCustomer,
  refreshToken,
  placeOrder,
  updateAccount,
  seeOrders,
  pay,
  rawPay,
} = require('../controllers/customerController');

// Addiional imports
const { authCustomer: auth } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/login', loginCustomer); // Tested.
router.post('/placeOrder', auth, placeOrder); // Tested.
router.post('/logout', auth, logoutCustomer); // Tested.
router.post('/token', refreshToken); // Tested.
router.post('/', createCustomer); // Tested.

// READ ROUTES
router.get('/orders', auth, seeOrders); // Tested.

// UPDATE ROUTES
router.put('/', auth, updateAccount); // Tested.

// DELETE ROUTES

// Tests
router.post('/pay', pay);
router.post('/rawPay', rawPay);

module.exports = router;
