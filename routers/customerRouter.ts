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
router.post('/login', loginCustomer);
router.post('/placeOrder', auth, placeOrder);
router.post('/logout', auth, logoutCustomer);
router.post('/token', refreshToken);
router.post('/', createCustomer);

// READ ROUTES
router.get('/orders', auth, seeOrders);

// UPDATE ROUTES
router.put('/', auth, updateAccount);

// DELETE ROUTES

// Tests
router.post('/pay', pay);
router.post('/rawPay', rawPay);

module.exports = router;
